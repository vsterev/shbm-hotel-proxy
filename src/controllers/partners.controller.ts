import { Body, Controller, Post, Res, Route, Security, Tags, TsoaResponse } from "tsoa";
import HbsAPI from "../services/hbs.Api.service";

@Tags("partners")
@Route("partners")
export class PartnersController extends Controller {
    @Post("booking/confirmation")
    @Security("partner")
    public async bookingConfirmation(
        @Body()
        body: {
            bookingNumber: string;
            confirmationNumber: string;
            message: string;
        },
        @Res() errorUpdate: TsoaResponse<422, { error: string }>,
        @Res() serverError: TsoaResponse<503, { error: string }>
    ) {
        try {

            const confirmation = await HbsAPI.confirmBooking(body);

            if (!confirmation) {
                return errorUpdate(422, { error: "Booking confirmation failed" });

            }

            return confirmation;

        } catch (error) {
            console.error((error as Error).message);
            return serverError(503, { error: "Error fetching from HBS" });
        }
    }

    @Post("booking/denial")
    @Security("partner")
    public async bookingDenial(
        @Body()
        body: {
            bookingNumber: string;
            message: string;
        },
        @Res() errorUpdate: TsoaResponse<422, { error: string }>,
        @Res() serverError: TsoaResponse<503, { error: string }>
    ) {
        try {

            const denial = await HbsAPI.denialBooking(body);

            if (!denial) {
                return errorUpdate(422, { error: "Booking denial failed" });

            }

            return denial;

        } catch (error) {
            console.error((error as Error).message);
            return serverError(503, { error: "Error fetching from HBS" });
        }
    }
}