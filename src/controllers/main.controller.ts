import { Body, Controller, Get, Path, Post, Queries, Query, Res, Route, Security, Tags, TsoaResponse } from 'tsoa';
import ParsingAPI from '../services/parsing.Api.service';
import { HotelResponse, IBooking } from '../interfaces/solvex.interface';
import QuendooAPI from '../services/quendooApi.service';
import ParsingNewAPI from '../services/parsingNew.Api.service';

const integrations = [
	{ name: 'parsing', displayName: 'Parsing-current', code: 'parserCode' },
	{ name: 'parsingNew', displayName: 'Parsing-new', code: 'parserCodeNew' },
	{ name: 'quendoo', displayName: 'Quendoo', code: 'quendooCode' },
];

@Tags('main')
@Route('')
export class MainController extends Controller {
	@Get('integrations')
	@Security('main')
	public possibleIntegrations(): {
		name: string;
		displayName: string;
		code: string;
	}[] {
		return integrations;
	}

	@Get('integration/{name}')
	@Security('main')
	public getIntegration(
		@Path() name: string,
		@Res() notFound: TsoaResponse<404, { error: string }>
	): { name: string; displayName: string; code: string } {
		const integration = integrations.find((integration) => integration.name === name);

		if (!integration || !integrations.some((integration) => integration.name === name)) {
			return notFound(404, { error: `Integration ${name} not found` });
		}

		return integration;
	}

	@Get('hotels')
	@Security('main')
	public async getHotels(
		@Query() integrationName: string,
		@Res() notFound: TsoaResponse<404, { error: string }>
	): Promise<HotelResponse[]> {
		if (!integrations.some((integration) => integration.name === integrationName)) {
			notFound(404, {
				error: `Integration ${integrationName} not found`,
			});
		}

		switch (integrationName) {
			case 'parsing':
				return (await ParsingAPI.getHotels()) || [];
			case 'parsingNew':
				return (await ParsingNewAPI.getHotels()) || [];
			case 'quendoo':
				return (await QuendooAPI.getHotels()) || [];
			default:
				return [];
		}
	}

	@Post('bookings')
	@Security('main')
	public async sendBookings(
		@Queries() query: { integrationName: string, flag: "new" | "change" | "cancel" },
		@Body() bookings: IBooking[],
		@Res() notFound: TsoaResponse<404, { error: string }>,
		@Res() integrationError: TsoaResponse<422, { error: string }>

	): Promise<{ errors: { booking: string; hotel: string }[]; processedBookings: IBooking[] }> {
		try {
			if (!integrations.some((integration) => integration.name === query.integrationName)) {
				notFound(404, {
					error: `Integration ${query.integrationName} not found`,
				});
			}

			switch (query.integrationName) {
				case 'parsing': {
					const { errors, processedBookings } = await ParsingAPI.sendBookings(bookings);
					return { errors, processedBookings };
				}
				case 'quendoo': {
					switch (query.flag) {
						case "new": {
							const { errors, processedBookings } = await QuendooAPI.sendNewBookings(bookings);
							return { errors, processedBookings };
						}
						case "change": {

							//check if are booking that have been chenged in IL before sending to Quendoo in this case they should be send to Quendoo with status new

							const changedBookingNotSendToQuendoo = bookings.filter((booking) => {
								return booking.hotelServices.some((hts) => hts.log?.response !== undefined);
							});

							const {
								errors: changedBookingNotSendToQuendooErrors,
								processedBookings: changedBookingNotSendToQuendooProcessedBookings
							} = await QuendooAPI.sendNewBookings(changedBookingNotSendToQuendoo);


							// QuendooAPI can not changed bookings - therefore they will not be send

							// should be add logic if reservation are chenged before initial send to Quendoo
							// const mapAction = {
							// 	New: 'NEW',
							// 	Changed: 'UPDATE', // mahnal sym go, zastoto poniakoga nashi nowi popadat v change - izprastam gi kato undefined
							// 	Cancel: 'CANCEL',
							// 	InWork: 'CANCEL',
							// };
							// const { errors, processedBookings } = await QuendooAPI.sendChangeBookings(bookings, query.flag);
							return {
								errors: changedBookingNotSendToQuendooErrors,
								processedBookings: changedBookingNotSendToQuendooProcessedBookings
							};
						}
						case "cancel": {
							const { errors, processedBookings } = await QuendooAPI.cancelBooking(bookings);
							return { errors, processedBookings };
						}
						default:
							return { errors: [], processedBookings: [] };
					}
				}
				case 'parsingNew': {
					const { errors, processedBookings } = await ParsingNewAPI.sendBookingsMessages(bookings);
					return { errors, processedBookings };
				}
				default:
					return { errors: [], processedBookings: [] };
			}
		} catch (error) {
			console.error(error);
			return integrationError(422, {
				error: `Error sending bookings to integration - ${error instanceof Error ? error.message : 'Unknown error'}`,
			});
		}
	}

	@Get('hotel-accommodations/{hotelId}')
	@Security('main')
	public async getHotelAccommodations(
		@Query() integrationName: string,
		@Path() hotelId: number,
		@Res() notFound: TsoaResponse<404, { error: string }>
	): Promise<{ rooms: string[]; boards: string[] }> {
		if (!integrations.some((integration) => integration.name === integrationName)) {
			notFound(404, {
				error: `Integration ${integrationName} not found`,
			});
		}

		switch (integrationName) {
			case 'parsing':
				return (
					(await ParsingAPI.getAccommodations(hotelId)) || {
						rooms: [],
						boards: [],
					}
				);
			case 'parsingNew':
				return (
					(await ParsingNewAPI.getAccommodations(hotelId)) || {
						rooms: [],
						boards: [],
					}
				);
			case 'quendoo':
				return (
					(await QuendooAPI.getAccommodations(hotelId)) || {
						rooms: [],
						boards: [],
					}
				);
			default:
				return { rooms: [], boards: [] };
		}
	}
}
