import envVaraibles from '../config/envVariables';
import redis from '../config/redis.config';
import {
	IParserBooking,
	IParserBookingResponse,
	IParserRoomResponse,
	IParsingHotelResponse,
} from '../interfaces/parsing.interface';
import { HotelResponse, IBooking, IBookingHotelService, ITourist } from '../interfaces/solvex.interface';
import SharedFunctions from './shared.functions';

export default class ParsingAPI {
	static async connect(): Promise<string | undefined> {
		const authStr = Buffer.from(envVaraibles.PARSER_USER + ':' + envVaraibles.PARSER_PASSWORD).toString('base64');

		try {
			const promiseResult = await fetch(`${envVaraibles.PARSER_URL}/BasicLogin`, {
				method: 'GET',
				headers: {
					Authorization: `Basic ${authStr}`,
				},
			});

			const token = await promiseResult.json();

			if (!token) {
				throw new Error('Error retrieving token from Parsing');
			}

			redis.set('parsingToken', token);
			redis.expire('parsingToken', 3600);

			return token;
		} catch (error) {
			console.error(error);
		}
	}

	private static async retrieveToken() {
		let token = await redis.get('parsingToken');

		if (!token) {
			token = (await this.connect()) ?? null;
		}

		if (!token) {
			throw new Error('Error retrieving token from HotelService');
		}

		return token;
	}

	static async getHotels(): Promise<HotelResponse[] | undefined> {
		try {
			const token = await this.retrieveToken();

			if (!token) {
				throw new Error('Error retrieving token from Parsing');
			}

			const promiseResult = await fetch(`${envVaraibles.PARSER_URL}/GetAgentHotels`, {
				method: 'GET',
				headers: {
					'Content-type': 'application/json',
					Authorization: token,
				},
			});

			const hotels: IParsingHotelResponse[] | undefined = await promiseResult.json();

			if (!hotels) {
				return [];
			}

			return hotels.map((el) => ({
				hotelName: el.Hotel,
				hotelId: el.HotelID,
				settings: {
					hotelServer: el.HotelServer,
					hotelServerId: el.PMS_ServerID,
					serverName: el.ServerName,
				},
			}));
		} catch (error) {
			console.error(error);
		}
	}

	static async getRooms(hotelId: number): Promise<IParserRoomResponse[] | undefined> {
		try {
			const promiseResult = await fetch(`${envVaraibles.PARSER_URL}/GetAgentHotelRoomTypes`, {
				method: 'POST',
				body: JSON.stringify({ HotelID: hotelId }),
				headers: { 'Content-type': 'application/json' },
			});
			return promiseResult.json();
		} catch (error) {
			console.error(error);
		}
	}

	static async getBoards(hotelId: number): Promise<string[] | undefined> {
		try {
			const promiseResult = await fetch(`${envVaraibles.PARSER_URL}/GetAgentHotelBoards`, {
				method: 'POST',
				body: JSON.stringify({ HotelID: hotelId }),
				headers: { 'Content-type': 'application/json' },
			});
			return promiseResult.json();
		} catch (error) {
			console.error(error);
		}
	}

	static formatDate = (dt: string) => {
		if (!dt) {
			return '';
		}
		const [y, m, d] = dt.substring(0, 10).split('-');
		return `${d}.${m}.${y}`;
	};

	static formatTourists = (tourists: ITourist[]) => {
		return tourists.map((el) => {
			return {
				name: el.name,
				birthDate: el.birthDate ? this.formatDate(el.birthDate) : '',
			};
		});
	};

	static async createReservation(booking: IParserBooking): Promise<IParserBookingResponse | undefined> {
		try {
			const token = await this.connect();
			if (!token) {
				throw new Error('Error retrieving token from Parsing');
			}

			const promiseResult = await fetch(`${envVaraibles.PARSER_URL}/NewResv`, {
				method: "POST",
				body: JSON.stringify(booking),
				headers: { "Content-type": "application/json", Authorization: token },
			});

			if (!promiseResult.ok) {
				throw new Error("Error creating reservation in Parsing");
			}

			const parserResponse = await promiseResult.json();

			// const parserResponse = {
			// 	Adults: 2,
			// 	Age1: null,
			// 	Age2: null,
			// 	Age3: null,
			// 	Age4: null,
			// 	Age5: null,
			// 	Age6: null,
			// 	Age7: null,
			// 	Board: 'ALL-',
			// 	// "CheckIn": "01.09.2022",
			// 	// "CheckOut": "10.09.2022",
			// 	CheckIn: '07.06.2025',
			// 	CheckOut: '14.06.2025',
			// 	Children: 0,
			// 	ConfirmationNo: '',
			// 	Hotel: 'Bolero',
			// 	Name1: 'LUKACOVA SIMONA',
			// 	Name2: 'LUKACOVA SIMONA      | SOBEK DAVID     ',
			// 	Name3: null,
			// 	Name4: null,
			// 	Name5: null,
			// 	Name6: null,
			// 	Name7: null,
			// 	PriceAmount: '1566',
			// 	PriceCurrency: 'EUR',
			// 	ResponseText: 'NEW:|24.06.22 16:59||5,5,5,5,5,5,5,5,5|5,5,5,5,5,5,5,5,5|cf=1|rq=0',
			// 	ResvID: 0,
			// 	RoomType: 'DBLDX',
			// 	// "Vocher": "2114698_2804931",
			// 	Voucher: '2271456-3598609',
			// 	isCancelled: '0',
			// };
			return parserResponse as unknown as IParserBookingResponse;
			// return undefined;
		} catch (error) {
			console.error(error);
		}
	}

	private static bookingSerialization(booking: IBooking, hts: IBookingHotelService): IParserBooking {
		const mapAction = {
			New: 'NEW',
			Changed: 'UPDATE', // mahnal sym go, zastoto poniakoga nashi nowi popadat v change - izprastam gi kato undefined
			Cancel: 'CANCEL',
			InWork: 'CANCEL',
		};

		return {
			Hotel: hts.integrationSettings?.hotelServer,
			RoomType: hts.roomIntegrationCode,
			CheckIn: this.formatDate(hts.checkIn),
			CheckOut: this.formatDate(hts.checkOut),
			Booked: this.formatDate(booking.creationDate!),
			Voucher: hts.bookingCode,
			Board: hts.boardIntegrationCode,
			Market: booking.marketName + " market",
			Remark: '',
			Status: mapAction[booking.action as keyof typeof mapAction],
			Adults: SharedFunctions.countOccupancy(hts.tourists).adults,
			Children: SharedFunctions.countOccupancy(hts.tourists).children,
			Comments: hts.note ? hts.note : '',
			Names: this.formatTourists(hts.tourists),
			Flight_Arr: booking.flightInfo?.flightArr.replace('(', '').replace(')', '').split(' - ')[0] || '',
			Flight_Arr_Time: booking.flightInfo?.flightArr.replace('(', '').replace(')', '').split(' - ')[1] || '',
			Flight_Dep: booking.flightInfo?.flightDep.replace('(', '').replace(')', '').split(' - ')[0] || '',
			Flight_Dep_Time: booking.flightInfo?.flightDep.replace('(', '').replace(')', '').split(' - ')[1] || '',
		};
	}

	static async getAccommodations(hotelId: number) {
		const parsingRooms = await this.getRooms(hotelId);
		const parsingRoomTypes = parsingRooms?.map((room) => room.RoomType);
		const parsingBoards = await this.getBoards(hotelId);
		if (!parsingRoomTypes || !parsingBoards) {
			throw new Error('Error retrieving rooms or boards from Parsing');
		}
		return { boards: parsingBoards, rooms: parsingRoomTypes };
	}

	static async sendBookings(bookings: IBooking[]): Promise<{
		errors: { booking: string; hotel: string }[];
		processedBookings: IBooking[];
	}> {
		const errors = [] as { booking: string; hotel: string }[];

		const processedBookings = await Promise.all(
			bookings.map(async (booking) => {
				await Promise.all(
					booking.hotelServices.map(async (hts) => {
						if (!hts.integrationSettings?.['serverName' as keyof IBookingHotelService]) {
							errors.push({
								booking: booking.bookingName,
								hotel: hts.hotel,
							});
							return;
						}

						const serializeParserBookingRequest = this.bookingSerialization(booking, hts);

						const parsingBookingResponse = await this.createReservation(serializeParserBookingRequest);

						const parserBbookingPrice = `${parsingBookingResponse?.PriceAmount} ${parsingBookingResponse?.PriceCurrency}`;

						const parserMessage = parsingBookingResponse?.ResponseText;

						const msgConfirmation = `parser -> price: ${parserBbookingPrice} | txt: ${parserMessage}`;

						hts.log = {
							send: serializeParserBookingRequest,
							response: parsingBookingResponse || ({} as IParserBookingResponse),
							sendDate: new Date(),
						};
						console.log('hts.log', JSON.stringify(hts.log, null, 2));
						if (
							(!!parsingBookingResponse?.ConfirmationNo && parsingBookingResponse.ConfirmationNo !== "0") &&
							booking.action !== 'Cancel' && (parserMessage?.toLowerCase().includes('new') || parserMessage?.toLowerCase().includes('updated'))
						) {
							hts.confirmationNumber = parsingBookingResponse?.ConfirmationNo;
							hts.msgConfirmation = msgConfirmation;
							// hts.status = 'Confirmed';
							hts.log.integrationStatus = 'confirmed';
							console.log('case1');
						} else if (booking.action === 'Cancel' && parserMessage?.toLowerCase().includes('cancelled')) {
							hts.log.integrationStatus = 'cancelled';
							console.log('case4');

						} else if (parserMessage?.toLowerCase().includes('no reservation created')
							|| parserMessage?.toLowerCase().includes('error')
							|| parserMessage?.toLowerCase().includes('empty detail')
						) {
							hts.log.integrationStatus = 'denied';
							console.log('case2');

						} else if (booking.action !== 'Cancel' && (!parsingBookingResponse?.ConfirmationNo || parsingBookingResponse?.ConfirmationNo === '0')) {
							//how to check WAIT status
							// hts.status = 'InWork';  //tova da se proveri
							hts.log.integrationStatus = 'wait';
							console.log('case3');

						}
						return hts;
					})
				);
				return booking;
			})
		);
		return { errors, processedBookings };
	}
}
