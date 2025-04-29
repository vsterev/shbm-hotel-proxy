import { Request } from 'express';
import envVariables from '../config/envVariables';

export async function expressAuthentication(request: Request, securityName: string): Promise<unknown> {
	if (['main', 'partner', 'quendoo_webhook'].includes(securityName)) {
		const token = request.headers['authorization']?.split(' ')[1];

		return new Promise((resolve, reject) => {
			if (!token) {
				const error = new Error('No token provided');
				return reject(error);
			}

			const key = `API_TOKEN_${securityName.toUpperCase()}` as keyof typeof envVariables;

			if (token === envVariables[key]) {
				return resolve({ name: securityName });
			} else {
				const error = new Error('Invalid token');
				reject(error);
			}
		});
	}
	return Promise.reject('Unknown security');
}
