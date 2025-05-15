// import { IParserBooking, IParserBookingResponse } from './parsing.interface';

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
	sex: string;
	hotelServiceId: number;
}

export interface ICostOffersInfo {
	costOfferName: string;
	costOfferDuration: number;
	costOfferDateBegin: string;
	costOfferDateEnd: string;
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
	roomIntegrationCode: string;
	boardIntegrationCode: string;
	integrationSettings: {
		apiName: string;
		hotelId: number;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		[key: string]: any; //  Allow dynamic keys for additional integration settings
	};
	costOffersInfo: ICostOffersInfo[];
	log?: {
		// send: IParserBooking;
		send: unknown;
		// response: IParserBookingResponse;
		response: unknown;
		manual?: { [key: string]: { booking: string; message: string } };
		sendDate?: Date;
		integrationStatus?: 'wait' | 'confirmed' | 'denied' | 'cancelled';
		integrationId?: string;
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
	action: "New" | "Change" | "Cancel";
	creationDate?: string;
	cancelDate?: string;
	changeDate?: string;
	marketId: number;
	marketName: string;
	messages: IMessage[];
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
	settings?: {
		// hotelServer?: string;
		// hotelServerId?: number;
		// serverName: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		[key: string]: any;
	};
}
