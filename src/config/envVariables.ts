import * as dotenv from 'dotenv';
import * as fs from 'fs';

if (!fs.existsSync('.env')) {
	console.error('.env not found!');
	process.exit(1);
}
dotenv.config();
if (
	!process.env.PARSER_URL ||
	!process.env.PARSER_USER ||
	!process.env.PARSER_PASSWORD ||
	!process.env.API_TOKEN_MAIN
) {
	console.error('.env not fully set up!');
	process.exit(1);
}

export default {
	NODE_ENV: process.env.NODE_ENV || 'DEV',
	APP_PORT: Number(process.env.APP_PORT) || 3030,
	DEBUG_MODE: process.env.DEBUG_MODE || 'false',
	REDIS_HOST: process.env.REDIS_HOST || 'localhost',
	REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,
	REDIS_PASSWORD: process.env.REDIS_PASSWORD,
	REDIS_DB: Number(process.env.REDIS_DB) || 0,
	HBS_URL: process.env.HBS_URL,
	PARSER_URL: process.env.PARSER_URL,
	PARSER_USER: process.env.PARSER_USER,
	PARSER_PASSWORD: process.env.PARSER_PASSWORD,
	PARSERNEW_URL: process.env.PARSERNEW_URL,
	PARSERNEW_USER: process.env.PARSERNEW_USER,
	PARSERNEW_PASSWORD: process.env.PARSERNEW_PASSWORD,
	QUENDOO_URL: process.env.QUENDOO_URL,
	QUENDOO_TOKEN: process.env.QUENDOO_TOKEN,
	API_TOKEN_MAIN: process.env.API_TOKEN_MAIN,
	API_TOKEN_PARTNER: process.env.API_TOKEN_PARTNER,
	API_TOKEN_QUENDOO_WEBHOOK: process.env.API_TOKEN_QUENDOO_WEBHOOK,
};
