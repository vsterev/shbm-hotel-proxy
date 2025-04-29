
export interface IQuendooProperty {
    id: number;
    name: string;
    description: string;
    type: string
    property_group: string;
    header_image: string;
    image: string;
    images: string[];
    currency: string;
    currency_code: string;
    round_precision: number;
    booking_type: string;
    max_guests_per_room: number;
    children_policy: {
        is_active: boolean,
        max_children_age: number,
        children_groups: { [key: string]: { code: string, from_age: number, to_age: number, label: string } }[];
    },
    checkin_time_from: string;
    checkin_time_to: string;
    checkout_time_from: string;
    checkout_time_to: string;
    location_id: number;
    amenities: { id: number, name: string, value: string }[];
    address: {
        country_code: string;
        country_name: string;
        area: number;
        location: string;
        zip: string;
        address_lines: { country_code: string, country_name: string, area: string, location: string, zip: string, address_lines: string[] }[];
    },
    gps: { lat: number, lng: number },
    contacts: {
        website_url: string;
        facebook_url: string;
        email: string;
        phones: string[];
    },
}

export interface IQuendooRoom {
    room: IQuendooBookingRoom
    rates: IQuendooBookingRoomRates;
}

export interface IQuendooPropertyResponse {
    property: IQuendooProperty;
    rooms: IQuendooRoom[];
}

export interface IQuendooTourist {
    first_name: string;
    last_name: string;
    adult: boolean;
    non_adult_age?: number
}

export interface IQuendooBooking {
    property: number;
    ref_id: string;
    booking_timestamp: number,
    checkin_date: string;
    checkout_date: string;
    client: {
        first_name: string;
        last_name: string,
        email: string;
        phone: string;
    },
    notes: string;
    items: [{
        room: number;
        rate: number,
        occupancy: {
            adults: number;
            children: number[];
        },
        guests: IQuendooTourist[],

        price: number;
        currency: string;

    }]
}

export interface IQuendooBookingResponse {
    id?: number;
    ref_id?: string;
    created_timestamp?: number;
    booking_timestamp?: number;
    checkin_date?: string;
    checkout_date?: string;
    /**
     * @description Reservation status. One of:
     *     - `REQUESTED` - If the property is configured to require booking confirmation, this will be the first status.
     *     Next will be either `APPROVED` or `CANCELLED`.
     *     - `CREATED` - If no confirmation is required, this will be the first status.
     *     - `APPROVED` - The booking was confirmed by the hotel.
     *     - `CHECKIN` - Guests have checked in.
     *     - `CHECKOUT` - Guests have checked out. No more status changes are expected.
     *     - `CANCELLED` - Booking is cancelled. No more status changes are expected.
     *
     * @enum {string}
     */
    booking_status?: "REQUESTED" | "CREATED" | "APPROVED" | "CHECKIN" | "CHECKOUT" | "CANCELLED";
    payment_status?: "WAITING" | "FAILED" | "DEPOSIT_PAID" | "PARTIALLY_PAID" | "FULLY_PAID" | "REFUNDED";
    total_amount?: number;
    currency?: string;
    notes?: string;
    property?: IQuendooPropertyResponse;
    client?: IQuendooClient;
    items?: IQuendooBookingItem[];
    /** @description SUBJECT TO CHANGE */
    payment_plan?: {
        index?: number;
        amount?: number;
        currency?: string;
        due_date?: string;
        payment_methods?: unknown[];
        is_paid?: boolean;
        payment_timestamp?: number;
    }[];
}

interface IQuendooClient {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    nationality?: string;
    i_want_invoice?: boolean;
    booking_for_someone_else?: boolean;
    company?: {
        name?: string;
        address?: string;
        reg_no?: string;
        vat_no?: string;
        rp_name?: string;
    };
}

interface IQuendooBookingItem {
    id?: number;
    ref_id?: string;
    room?: IQuendooBookingRoom;
    rate?: IQuendooBookingRoomRates;
    extra_services_included?: {
        name?: string;
        short_desc?: string;
    }[];
    beds_preferences?: unknown[];
    guests?: IQuendooGuestInfo[];
}

interface IQuendooBookingRoom {
    roomInfo: {
        id?: number;
        name?: string;
        description?: string;
        type?: string;
        area?: number;
        image?: string;
        images?: string[];
        amenities?: unknown[];
        qty?: number;
        acm_settings?: IQuendooBookingAsmSettings;
        bedrooms?: unknown[];
    };
}

interface IQuendooBookingAsmSettings {
    regular_beds?: {
        qty?: number;
        codes?: ("A" | "T" | "C" | "I")[];
    };
    extra_beds?: {
        qty?: number;
        codes?: ("A" | "T" | "C" | "I")[];
    };
    extra_beds_children_only?: {
        qty?: number;
        codes?: ("T" | "C" | "I")[];
    };
    no_beds?: {
        qty?: number;
        codes?: ("T" | "C" | "I")[];
    };
}

interface IQuendooBookingRoomRates {
    id?: number;
    name?: string;
    description?: string;
    booking_types?: unknown;
    agency_info?: unknown;
    per_room?: boolean;
    sell_type?: IQuendooRoomSellType;
    /**
     * @description - `BO` - Bed only
     *     - `BB` - Bed and Breakfast
     *     - `HB` - Half board
     *     - `FB` - Full board
     *     - `AI` - All inclusive
     *     - `UAI` - Ultra all inclusive
     *
     * @enum {string}
     */
    meal_plan_code?: "BO" | "BB" | "HB" | "FB" | "AI" | "UAI";
    meal_plan_name?: string;
    payment_policy?: {
        description?: string;
        payments?: {
            pay_type?: "on_res" | "af_res" | "on_arr" | "be_arr" | "on_dep" | "be_dat";
            num_days?: number;
            date?: string;
            amount_type?: "total_price" | "first_night" | "percent_from_total_price" | "percent_from_first_night" | "fixed" | "remaining" | "free";
            amount_value?: number;
        }[];
    };
    cancellation_policy?: {
        name?: string;
        short_desc?: string;
        description?: string;
        items?: unknown[];
    };
    /** @description List of all extra services that are included in this rate plan */
    extra_services_included?: {
        id?: number;
        name?: string;
        short_desc?: string;
        description?: string;
        image?: string;
    }[];
    /** @description List of extra services that are sold separately */
    extra_services_available?: unknown[];
}

type IQuendooRoomSellType = "per_room" | "per_person" | "per_occupancy";

interface IQuendooGuestInfo {
    first_name: string;
    last_name: string;
    adult: boolean;
    non_adult_age?: number;
}