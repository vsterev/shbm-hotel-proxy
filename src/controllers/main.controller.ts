import { Body, Controller, Get, Path, Post, Query, Res, Route, Security, Tags, TsoaResponse } from 'tsoa';
import ParsingAPI from '../services/parsing.Api.service';
import { HotelResponse, IBooking } from '../interfaces/solvex.interface';

const integrations = [
	{ name: 'parsing', displayName: 'Parsing', code: 'parserCode' },
	{ name: 'excely', displayName: ' Excely', code: 'excelyCode' },
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
			default:
				return [];
		}
	}

	@Post('bookings')
	@Security('main')
	public async sendBookings(
		@Query() integrationName: string,
		@Body() bookings: IBooking[],
		@Res() notFound: TsoaResponse<404, { error: string }>
	): Promise<{ errors: { booking: string; hotel: string }[]; processedBookings: IBooking[] }> {
		try {
			if (!integrations.some((integration) => integration.name === integrationName)) {
				notFound(404, {
					error: `Integration ${integrationName} not found`,
				});
			}

			switch (integrationName) {
				case 'parsing':
					// eslint-disable-next-line
					const { errors, processedBookings } = await ParsingAPI.sendBookings(bookings);
					return { errors, processedBookings };
				default:
					return { errors: [], processedBookings: [] };
			}
		} catch (error) {
			console.error(error);
			throw new Error('Error sending bookings');
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
			default:
				return { rooms: [], boards: [] };
		}
	}
}
