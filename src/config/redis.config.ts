import Redis from 'ioredis';
import envVariables from './envVariables';

const redis = new Redis({
	host: envVariables.REDIS_HOST || 'localhost',
	port: envVariables.REDIS_PORT ?? 6379,
	password: envVariables.REDIS_PASSWORD || '',
	db: envVariables.REDIS_DB
});

export default redis;
