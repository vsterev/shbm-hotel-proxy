import * as dotenv from 'dotenv';
import { HotelResponse, IBooking, IBookingHotelService, ITourist } from '../interfaces/solvex.interface';
import { IQuendooBooking, IQuendooBookingResponse, IQuendooPropertyResponse, IQuendooTourist } from '../interfaces/quendoo.interface';
import SharedFunctions from './shared.functions';
import envVariables from '../config/envVariables';
dotenv.config();

export default class QuendooAPI {

    private static async quendooClient(
        { path, method, data }: { path: string, method: "GET" | "POST" | "PATCH", data?: unknown }
    ) {
        const response = await fetch(`${envVariables.QUENDOO_URL}/${path}`, {
            method,
            headers: {
                Authorization: `Bearer ${envVariables.QUENDOO_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: method === 'POST' ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
            if (response.status === 400) {
                const result = await response.json();
                console.log('result', result[0].message);
                throw new Error(result[0].message);
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    static async getHotels(): Promise<HotelResponse[] | undefined> {
        try {
            const properties = await this.quendooClient({ path: 'properties?locale=en', method: 'GET' });

            return properties.map((property: IQuendooPropertyResponse) => {
                return { hotelId: property.property.id, hotelName: property.property.name };
            });
        } catch (error) {
            console.error('Error fetching hotels from Quendoo:', error);
            return undefined;
        }
    }

    static async getAccommodations(hotelId: number) {

        const properties = await this.quendooClient({ path: 'properties?locale=en', method: 'GET' });

        const rooms = properties.find((property: IQuendooPropertyResponse) => property.property.id === hotelId)?.rooms.map((room: { room: { id: number; name: string } }) => room.room.id + "->" + room.room.name) || [];

        const rates = properties.find((property: IQuendooPropertyResponse) => property.property.id === hotelId)?.rooms.map((room: { rates: { id: number; meal_plan_code: string }[] }) => room.rates) || [];

        const boards = rates.flat().reduce((acc: string[], rate: { id: number; meal_plan_code: string }) => {
            const str = `${rate.id}->${rate.meal_plan_code}`;
            if (!acc.includes(str)) {
                acc.push(str);
            }
            return acc;
        }, [] as string[]);

        return { boards, rooms };
    }

    private static formatDate = (dt: string) => {
        const [y, m, d] = dt.substring(0, 10).split('-');
        return `${y}-${m}-${d}`;
    };

    private static formatTourists(tourists: ITourist[]): IQuendooTourist[] {
        return tourists.map(tourist => {
            return {
                first_name: tourist.name.split(' ')[1],
                last_name: tourist.name.split(' ')[0],
                adult: ["MR", "MRS"].includes(tourist.sex),
                non_adult_age: ["CHD", "INF"].includes(tourist.sex) ? SharedFunctions.getFullYearDiff(tourist.birthDate!) : undefined
            };
        });
    }

    private static childAgeArray(tourists: ITourist[]): number[] {
        const childArray: number[] = [];

        tourists.map(tourist => {
            if (["CHD", "INF"].includes(tourist.sex)) {
                const childAge = SharedFunctions.getFullYearDiff(tourist.birthDate!);
                childArray.push(childAge);
            }
        });

        return childArray;
    }

    private static newBookingPrepare(booking: IBooking, hts: IBookingHotelService): IQuendooBooking {

        const firstTourist = {
            first_name: this.formatTourists(hts.tourists)[0].first_name,
            last_name: this.formatTourists(hts.tourists)[0].last_name,
            email: "office@solvex.bg",
            phone: "+35929358000"
        };

        const notes = {
            market: booking.marketName.slice(1), costOffers: hts.costOffersInfo.map(costOffer => {
                return `${costOffer.costOfferDuration}-${costOffer.costOfferName}`;
            }).join(', ')
        };

        return {
            //should add new logic attach quendoo status dependent from hts.status
            property: hts.integrationSettings?.hotelCode,
            ref_id: hts.bookingCode,
            booking_timestamp: new Date().getTime(),
            checkin_date: this.formatDate(hts.checkIn),
            checkout_date: this.formatDate(hts.checkOut),
            client: firstTourist,
            notes: JSON.stringify(notes),
            items: [{
                room: + hts.roomIntegrationCode.split('->')[0],
                rate: + hts.boardIntegrationCode.split('->')[0],
                occupancy: {
                    adults: SharedFunctions.countOccupancy(hts.tourists).adults,
                    children: this.childAgeArray(hts.tourists),
                },
                guests: this.formatTourists(hts.tourists),
                // wait Megatec to return hotelService price in hotelService
                price: 1000,
                currency: "BGN"
            }]
        };
    }

    static async sendNewBookings(bookings: IBooking[]): Promise<{
        errors: { booking: string; hotel: string }[];
        processedBookings: IBooking[];
    }> {

        const errors = [] as { booking: string; hotel: string }[];

        const processedBookings = await Promise.all(
            bookings.map(async (booking) => {
                await Promise.all(
                    booking.hotelServices.map(async (hts) => {
                        if (!hts.integrationSettings?.['hotelCode' as keyof IBookingHotelService]) {
                            errors.push({
                                booking: booking.bookingName,
                                hotel: hts.hotel,
                            });
                            return;
                        }

                        const serializeParserBookingRequest = this.newBookingPrepare(booking, hts);

                        const quendooBookingResponse: IQuendooBookingResponse = await this.quendooClient(
                            {
                                path: 'booking/with-price',
                                method: 'POST', data: serializeParserBookingRequest
                            });

                        hts.log = {
                            send: serializeParserBookingRequest,
                            response: quendooBookingResponse || ({} as IQuendooBookingResponse),
                            integrationId: String(quendooBookingResponse.id),
                            sendDate: new Date(),
                        };

                        switch (quendooBookingResponse.booking_status) {
                            // change logic in friday according Goryan call
                            case 'REQUESTED':
                            case 'CREATED': {
                                // hts.status = 'Wait';
                                hts.msgConfirmation = "Booking is waiting approval from Quendoo";
                                hts.log.integrationStatus = 'wait';
                                break;
                            }
                            case 'APPROVED': {
                                if (booking.action !== 'Cancel') {
                                    // ask where get conformationNumber
                                    hts.confirmationNumber = String(quendooBookingResponse.id);
                                    hts.msgConfirmation = String(quendooBookingResponse.id) + "/" + new Date().toLocaleString();
                                    hts.status = 'Confirmed';
                                    hts.log.integrationStatus = 'confirmed';
                                    break;
                                } else {
                                    hts.status = 'Cancel';
                                    hts.log.integrationStatus = 'denied';
                                    break;
                                }
                            }
                            case 'CANCELLED': {
                                hts.status = 'Cancel';
                                hts.log.integrationStatus = 'denied';
                                hts.msgConfirmation = "Booking is cancelled from Quendoo";
                                break;
                            }

                        }
                        return hts;
                    })
                );
                return booking;
            })
        );
        return { errors, processedBookings };
    }

    static async cancelBooking(bookings: IBooking[]): Promise<{
        errors: { booking: string; hotel: string }[];
        processedBookings: IBooking[];
    }> {
        const errors = [] as { booking: string; hotel: string }[];

        const processedBookings = await Promise.all(
            bookings.map(async (booking) => {
                await Promise.all(
                    booking.hotelServices.map(async (hts) => {

                        if (!hts.integrationSettings?.['hotelCode' as keyof IBookingHotelService]) {
                            errors.push({
                                booking: booking.bookingName,
                                hotel: hts.hotel,
                            });
                            return;
                        }
                        const quendooBookingResponse: IQuendooBookingResponse = await this.quendooClient(
                            {
                                path: `booking/cancel?id=${(hts.log?.response as IQuendooBookingResponse).id}&ref_id=${hts.bookingCode}`,
                                method: 'PATCH',
                            });

                        console.log('quendooCancelBookingResponse', quendooBookingResponse);

                        console.log('quendooCancelBookingResponse', quendooBookingResponse.booking_status);

                        hts.log = {
                            send: `booking/cancel?id=${(hts.log?.response as IQuendooBookingResponse).id}&ref_id=${hts.bookingCode}`,
                            response: quendooBookingResponse || ({} as IQuendooBookingResponse),
                            sendDate: new Date(),
                            integrationId: String(quendooBookingResponse.id),
                        };

                        hts.status = 'Cancel';
                        hts.log.integrationStatus = 'cancelled';
                        hts.log.integrationId = String((hts.log?.response as IQuendooBookingResponse).id);
                        return hts;
                    })
                );
                return booking;
            })
        );
        return { errors, processedBookings };
    }
}
