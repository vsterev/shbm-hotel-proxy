import redis from "../config/redis.config";
import envVaraibles from '../config/envVariables';
import { IParsingNewBoardResponse, IParsingNewBookingRequest, IParsingNewHotelResponse, IParsingNewMessageResponse, IParsingNewRoomResponse, IParsingNewTopicRequest, IParsingNewTopicResponse } from "../interfaces/parsingNew.interface";
import { HotelResponse, IBooking, IBookingHotelService, ITourist } from "../interfaces/solvex.interface";
import SharedFunctions from "./shared.functions";


export default class ParsingNewAPI {
    private static async connect(): Promise<string | undefined> {
        try {
            const promiseResult = await fetch(`${envVaraibles.PARSERNEW_URL}/api-token-auth/`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({
                    username: envVaraibles.PARSERNEW_USER,
                    password: envVaraibles.PARSERNEW_PASSWORD,
                }),
            });

            const tokenResponse = await promiseResult.json();

            if (!tokenResponse) {
                throw new Error('Error retrieving token from Parsing');
            }

            redis.set('parsingNewToken', tokenResponse.token);
            redis.expire('parsingNewToken', 3600);

            return tokenResponse.token;
        } catch (error) {
            console.error(error);
        }
    }

    private static async retrieveToken() {
        let token = await redis.get('parsingNewToken');

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
            const promiseResult = await fetch(`${envVaraibles.PARSERNEW_URL}/Hotel/`, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json',
                    Authorization: `Token ${token}`,
                },
            });

            const hotelsResponse: IParsingNewHotelResponse | undefined = await promiseResult.json();

            if (!hotelsResponse) {
                return [];
            }

            const hotels = hotelsResponse.results;

            return await Promise.all(hotels.map(async (el) => {

                return {
                    hotelName: el.name,
                    hotelId: el.id,
                    settings: {
                        pmsName: el.name_pms,
                        hotelName: el.name,
                        hotelCode: el.code,
                        corp: el.corp,
                    },
                };
            }));
        } catch (error) {
            console.error(error);
        }
    }

    private static async getHotelCorp(corpId: number): Promise<{ id: number; name: string } | undefined> {
        try {
            const token = await this.retrieveToken();

            const response = await fetch(`${envVaraibles.PARSERNEW_URL}/Corp/${corpId}`, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json',
                    Authorization: `Token ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch corp with ID ${corpId}`);
            }

            const corpResponse = await response.json();

            return corpResponse;
        } catch (error) {
            console.error(error);
        }
    }

    private static formatTourists(tourists: ITourist[], dateCheckIn: string): IParsingNewBookingRequest["guests"] {
        return tourists.map(tourist => {
            return {
                prefix_name: tourist.sex,
                name: tourist.name,
                first_name: tourist.name.split(' ')[1],
                last_name: tourist.name.split(' ')[0],
                age: tourist.birthDate ? SharedFunctions.getTouristAge(tourist.birthDate, dateCheckIn) : undefined,
                birth_date: tourist.birthDate ? tourist.birthDate.substring(0, 10) : undefined,
            };
        });
    }

    private static bookingSerialization(booking: IBooking, hts: IBookingHotelService): IParsingNewBookingRequest {
        enum MapAction {
            New = 1,
            Changed = 2,
            Cancel = 3,
        }

        const mapAction = MapAction;

        return {
            reference: hts.bookingCode,
            hotel: hts.integrationSettings?.hotelName,
            hotel_code: hts.integrationSettings?.hotelCode,
            roomtype: hts.roomIntegrationCode.split("=>")[0],
            roomType_code: hts.roomIntegrationCode.split("=>")[1],
            board: hts.boardIntegrationCode.split("=>")[0],
            board_code: hts.boardIntegrationCode.split("=>")[1],
            date_in: hts.checkIn.substring(0, 10),
            date_out: hts.checkOut.substring(0, 10),
            market: booking.marketName,
            status: mapAction[booking.action as keyof typeof mapAction],
            adults: SharedFunctions.countOccupancy(hts.tourists).adults,
            children: SharedFunctions.countOccupancy(hts.tourists).children,
            child_ages: SharedFunctions.childAges(hts.tourists, hts.checkIn),
            comments: hts.note ? hts.note : '',
            guests: this.formatTourists(hts.tourists, hts.checkIn),
        };
    }

    static async getRooms(hotelId: number) {
        try {
            const token = await this.retrieveToken();

            const response = await fetch(`${envVaraibles.PARSERNEW_URL}/Room?hotel=${hotelId}`, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json',
                    Authorization: `Token ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch rooms for hotelId ${hotelId}`);
            }

            const promiseResponse: IParsingNewRoomResponse | undefined = await response.json();

            if (!promiseResponse) {
                return [];
            }

            return promiseResponse.results;
        } catch (error) {
            console.error(error);
        }
    }

    static async getBoards(hotelId: number) {
        try {
            const token = await this.retrieveToken();

            const response = await fetch(`${envVaraibles.PARSERNEW_URL}/Board?hotel=${hotelId}`, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json',
                    Authorization: `Token ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch boards for hotelId ${hotelId}`);
            }

            const promiseResponse: IParsingNewBoardResponse | undefined = await response.json();

            if (!promiseResponse) {
                return [];
            }

            console.log(promiseResponse.results);

            return promiseResponse.results;
        } catch (error) {
            console.error(error);
        }
    }

    static async getAccommodations(hotelId: number) {
        const parsingRooms = await this.getRooms(hotelId);
        const parsingRoomTypes = parsingRooms?.map((room) => `${room.name}=>${room.code}`);
        const parsingBoards = await this.getBoards(hotelId);
        const parsingBoardTypes = parsingBoards?.map((board) => `${board.name}=>${board.name}`);
        if (!parsingRoomTypes || !parsingBoardTypes) {
            throw new Error('Error retrieving rooms or boards from Parsing');
        }
        return { boards: parsingBoardTypes, rooms: parsingRoomTypes };
    }

    static async createTopic(topic: string, hotelId: number, corpUrl: string, channel: number = 13): Promise<IParsingNewTopicResponse> {
        const token = await this.retrieveToken();

        const bodyData: IParsingNewTopicRequest = {
            corp: corpUrl,
            hotel: `${envVaraibles.PARSERNEW_URL}/Hotel/${hotelId}/`,
            channel,
            subject: topic,
        };

        const response = await fetch(`${envVaraibles.PARSERNEW_URL}/Topic/`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(bodyData),
        });

        if (!response.ok) {
            throw new Error(`Failed to create topic: ${response.statusText}`);
        }

        return await response.json();
    }

    static async createMessage(topicId: number, name: string, booking: IParsingNewBookingRequest): Promise<IParsingNewMessageResponse> {
        const token = await this.retrieveToken();

        const bodyData = {
            topic: `${envVaraibles.PARSERNEW_URL}/Topic/${topicId}/`,
            name,
            message: JSON.stringify(booking),
        };

        const response = await fetch(`${envVaraibles.PARSERNEW_URL}/Message/`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(bodyData),
        });

        if (!response.ok) {
            throw new Error(`Failed to create message: ${response.statusText}`);
        }

        return await response.json();
    }
    static async sendBookingsMessages(bookings: IBooking[]): Promise<{
        errors: { booking: string; hotel: string }[];
        processedBookings: IBooking[];
    }> {
        try {
            const errors = [] as { booking: string; hotel: string }[];
            const processedBookings = await Promise.all(bookings.map(async (booking) => {
                const hotelIntegrationId = booking.hotelServices[0].integrationSettings?.hotelId;
                const hotelIntegrationCorp = booking.hotelServices[0].integrationSettings?.corp;
                const topic = await this.createTopic(`Booking ${booking.bookingName}`, hotelIntegrationId, hotelIntegrationCorp);

                booking.hotelServices.map(async (hts) => {
                    const bookingRequest = this.bookingSerialization(booking, hts);
                    const message = await this.createMessage(topic.id, hts.bookingCode, bookingRequest);


                    if (!message) {
                        errors.push({ booking: booking.bookingName, hotel: hts.hotel });
                        return { errors, processedBookings: [] };
                    }
                    hts.log = {
                        send: bookingRequest,
                        response: bookingRequest || ({} as IParsingNewMessageResponse),
                        sendDate: new Date(),
                        //all bookings status will be changed later from parsing using custom endpoint 
                        integrationStatus: 'wait',
                        integrationId: String(message.id),
                    };

                    return hts;

                });
                return booking;
            })
            );
            return { errors, processedBookings };
        } catch (error) {
            console.error(error);
            return { errors: [], processedBookings: [] };
        }
    }
}