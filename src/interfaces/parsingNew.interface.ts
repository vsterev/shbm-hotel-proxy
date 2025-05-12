export interface IParsingNewHotelResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results:
	{
		id: number;
		name: string;
		name_pms: string;
		code: string | null;
		place: string | null;
		corp: string;
		last_update: string | null;
		update_delay_seconds: number;
	}[]
}

export interface IParsingNewBookingRequest {

	reference: string;
	hotel: string;
	hotel_code: string;
	roomtype: string;
	roomType_code: string;
	board: string;
	board_code: string;
	status: 1 | 2 | 3;
	adults: number;
	children: number;
	child_ages: number[];
	priceitem?: string;
	amount?: number;
	market: string;
	guest?: string;
	guests: {
		prefix_name: string,
		name: string,
		first_name: string,
		last_name: string,
		age?: number
		birth?: string,

	}[];
	comments: string;
	date_in: string;
	date_out: string

}

export interface IParsingNewRoomResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results:
	{
		id: number;
		hotel: string;
		building: null;
		name: string;
		code: string;
		name_pms: string;
		rang: number;
		size: number;
		is_active: boolean;
		min_pax: number;
		max_pax: number;
		min_ad: number;
		max_ad: number;
		min_ch: number;
		max_ch: number;
		ex_inf: number;
		regular_beds: number;
		extra_beds: number;
	}[]
}

export interface IParsingNewBoardResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: {
		id: number;
		hotel: string;
		name: string;
		code: string;
		breakfast: boolean;
		lunch: boolean;
		dinner: boolean;
		snacks: boolean;
		other: boolean;
		name_pms: string | null
	}[]
}

export interface IParsingNewTopicRequest {
	corp: string;
	hotel: string;
	channel: number;
	subject: string;

}
export interface IParsingNewTopicResponse {
	id: number;
	corp: string;
	hotel: string;
	channel: number;
	message_id: number;
	received: null;
	subject: string;
	sender: string;
	proceed: null;
	status: 1 | 2 | 3;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	result: any[]
}


export interface IParsingNewMessageRequest {
	topic: string;
	name: string;
	message: string;
}

export interface IParsingNewMessageResponse {
	id: number;
	topic: number;
	name: string;
	text: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	result: any[];
	parsed_time: string | null;
	mapped_time: string | null;
	result_time: string | null;
	status: number;
	new: number;
	existing: number;
	missing: number;
	errors: number;
	pending: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	roomspans: any[]
}