export interface IParsingHotelResponse {
  Hotel: string;
  HotelID: number;
  HotelServer: string;
  PMS_ServerID: number;
  ServerName: string;
}

export interface IParserBooking {
  Hotel: string;
  RoomType: string;
  CheckIn: string;
  CheckOut: string;
  Booked: string;
  Voucher: string;
  Board: string;
  Market: string;
  Remark?: string;
  Status: string;
  Comments?: string;
  Flight_Arr?: string;
  Flight_Arr_Time?: string;
  Flight_Dep?: string;
  Flight_Dep_Time?: string;
  Names: {
    name: string;
    birthDate?: string;
  }[];
}
export interface IParserBookingResponse {
  Adults: number;
  Age1: number;
  Age2?: number;
  Age3?: number;
  Age4?: number;
  Age5?: number;
  Age6?: number;
  Age7?: number;
  Board: string;
  CheckIn: string;
  CheckOut: string;
  Children: number;
  ConfirmationNo: string;
  Hotel: string;
  Name1: string;
  Name2?: string;
  Name3?: string;
  Name4?: string;
  Name5?: string;
  Name6?: string;
  Name7?: string;
  PriceAmount: number;
  PriceCurrency: string;
  ResponseText: string;
  ResvID: number;
  RoomType: string;
  Vocher: string;
  isCancelled: string;
}

export interface IParserRoomResponse {
  MaxAdults: number;
  MaxChildren: number;
  MaxPax: number;
  MinAdults: number;
  MinChildren: number;
  MinPax: number;
  RoomCategory: string | null;
  RoomType: string;
}
