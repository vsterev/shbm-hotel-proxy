import { IParserBooking, IParserBookingResponse } from "./parsing.interface";

export interface IMessage {
    id: string;
    sender?: string;
    isRead: boolean;
    text: string;
    isOutgoing: boolean;
    dateCreate: string;
}

export interface ITourist {
    name: string;
    birthDate?: string;
    sex?: string;
    hotelServiceId?: number;
}

export interface IBookingHotelService {
    serviceId: number;
    serviceName: string;
    bookingCode: string;
    hotelId: number;
    hotel: string;
    pansionId: number;
    pansion: string;
    roomTypeId: number;
    roomType: string;
    roomMapCode: string;
    roomAccommodationId: number;
    roomAccommodation: string;
    roomCategoryId: number;
    roomCategory: string;
    confirmationNumber?: string;
    msgConfirmation?: string;
    checkIn: string;
    checkOut: string;
    status: string;
    note?: string;
    tourists: ITourist[];
    priceRemark?: string;
    roomIntegrationCode?: string;
    boardIntegrationCode?: string;
    integrationSetings?: {
        apiName?: string;
        hotelCode?: number;
        [key: string]: any;
    };
}

export interface IFlight {
    flightArr: string;
    flightDep: string;
}

export interface IBooking {
    _id?: string;
    bookingName: string;
    bookingId: number;
    action: string;
    creationDate?: string;
    cancelDate?: string;
    changeDate?: string;
    marketId: number;
    marketName: string;
    messages: IMessage[];
    log?: {
        send: IParserBooking;
        response: IParserBookingResponse;
        manual?: { [key: string]: { booking: string; message: string } };
        sendDate?: Date;
    };
    hotelServices: IBookingHotelService[];
    flightInfo?: IFlight;
    dateInputed?: Date;
}

interface IBoardMap {
    boardId: number;
    boardName: string;
    parserCode?: string;
}

interface IRoomMap {
    roomTypeId: number;
    roomTypeName: string;
    roomCategoryId: number;
    roomCategoryName: string;
    parserCode?: string;
}

export interface IHotelMap {
    _id: number;
    hotelId: number;
    hotelName: string;
    hotelCode?: string;
    cityId: number;
    cityName: string;
    boards: { [key: string]: IBoardMap };
    rooms: { [key: string]: IRoomMap };
    parserCode?: number;
    parserName?: string;
    parserHotelServer?: string;
}

export interface HotelResponse {
    hotelId: number;
    hotelName: string;
    settings: {
        hotelServer: string;
        hotelServerId: number;
        serverName: string;
    }
}

