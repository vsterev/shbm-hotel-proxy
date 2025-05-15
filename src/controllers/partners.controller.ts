import { Body, Controller, Post, Res, Route, Security, Tags, TsoaResponse } from 'tsoa';
import HbsAPI from '../services/hbs.Api.service';
import { IQuendooBookingResponse } from '../interfaces/quendoo.interface';

@Tags('partners')
@Route('partners')
export class PartnersController extends Controller {
	@Post('booking/confirmation')
	@Security('partner')
	public async bookingConfirmation(
		@Body()
		body: {
			bookingNumber: string;
			confirmationNumber: string;
			message: string;
			partnerBookingId?: string;
		},
		@Res() errorConfirm: TsoaResponse<422, { status: "failure" | "success", message: string }>,
	): Promise<{ status: "failure" | "success", message: string }> {
		try {
			const partnerBookingId = body.partnerBookingId || "";
			const confirmation = await HbsAPI.confirmBooking({ ...body, partnerBookingId });

			if (!confirmation) {
				// return errorConfirm(422, { status: "failure", message: 'Booking confirmation failed' });
				throw Error('Booking confirmation failed');
			}

			return confirmation;
		} catch (error) {
			console.error((error as Error).message);
			return errorConfirm(422, { status: "failure", message: (error as Error).message });
		}
	}

	@Post('booking/denial')
	@Security('partner')
	public async bookingDenial(
		@Body()
		body: {
			bookingNumber: string;
			message: string;
			partnerBookingId?: string;
		},
		@Res() errorUpdate: TsoaResponse<422, { status: "failure" | "success", message: string }>,
	): Promise<{ status: "failure" | "success", message: string }> {
		try {
			const partnerBookingId = body.partnerBookingId || "";
			const denial = await HbsAPI.denialBooking({ ...body, partnerBookingId });

			if (!denial) {
				throw Error('Booking denial failed');
			}

			return { status: "success", message: 'Booking was denied' };
		} catch (error) {
			console.error((error as Error).message);
			return errorUpdate(422, { status: "failure", message: (error as Error).message });
		}
	}

	@Post('booking/quendoo-hook/')
	@Security('quendoo_webhook')
	public async quendooHook(
		@Body() body: unknown,
		@Res() errorUpdate: TsoaResponse<422, { success: boolean, error: string }>,
		@Res() serverError: TsoaResponse<503, { error: string }>
	) {
		try {
			const bookingCode = (body as IQuendooBookingResponse).ref_id;
			const quendooId = (body as IQuendooBookingResponse).id;
			const status = (body as IQuendooBookingResponse).booking_status;

			if (status && !['APPROVED', "CANCELLED", "REQUESTED", "CREATED"].includes(status)) {
				return errorUpdate(422, {
					error: "Status is not possible to update",
					success: false
				});
			}

			if (!bookingCode || !status) {
				return errorUpdate(422, { success: false, error: 'Invalid data' });
			}

			//check if booking is for this customer

			switch (status) {
				case 'APPROVED': {
					const confirmation = await HbsAPI.confirmBooking({
						bookingNumber: bookingCode,
						confirmationNumber: quendooId + new Date().toISOString(),
						message: 'Booking confirmed from Quendoo',
						partnerBookingId: String(quendooId),
					});
					if (!confirmation) {
						return errorUpdate(422, { success: false, error: 'Booking confirmation failed' });
					}
					return { success: true, message: 'Booking confirmed in Solvex' };
				}
				case 'CANCELLED': {
					const denied = await HbsAPI.denialBooking({
						bookingNumber: bookingCode,
						message: 'Booking is cancelled from Quendoo',
						partnerBookingId: String(quendooId),

					});
					if (!denied) {
						return errorUpdate(422, { success: false, error: 'Booking denial failed' });
					}
					return { success: true, message: 'Booking cancelled in Solvex' };
				}
				case 'REQUESTED':
				case 'CREATED':
				default:
					return errorUpdate(422, { success: false, error: 'Status could not be changed' });
			}

		} catch (error) {
			console.error((error as Error).message);
			return serverError(503, { error: 'Error fetching from HBS' });
		}
	}
}
