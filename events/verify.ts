import { APIGatewayProxyEvent } from 'aws-lambda';
import { jwtVerify } from 'jose';
import { parseCookies } from '../lib/cookieParser';

export const verify = async (event: APIGatewayProxyEvent) => {
    const rawCookies = event.headers['cookie'] || event.headers['Cookie'];
    const cookies = parseCookies(rawCookies);
    const token = cookies['token'];

    if (!token) {
        throw new Error('Unathorized: No token provided');
    }

    const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET)
    );

    return payload;
}