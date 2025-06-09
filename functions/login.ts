import { APIGatewayProxyHandler } from 'aws-lambda';
import { dynamodb } from '../lib/dynamoClient';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export const loginUser: APIGatewayProxyHandler = async (event) => {
    const body = JSON.parse(event.body || "{}");
    console.log("Received login request:", body);

    if (!body || !body.email || !body.password) {
        console.warn("Missing required fields");
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "email and password are required" }),
        };
    }

    const { email, password } = body;
    console.log("Checking for existing user with email:", email);

    let token;

    try {
        const user = await dynamodb.send(new GetCommand({
            TableName: "Users",
            Key: { email },
        }));

        if (!user.Item) {
            console.warn("User not found with email:", email);
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "User not found" }),
            };
        }

        console.log("User found:", user.Item);

        const isPasswordValid = await bcrypt.compare(password, user.Item.password);

        if (!isPasswordValid) {
            console.warn("Invalid password for email:", email);
            return {
                statusCode: 401,
                body: JSON.stringify({ error: "Invalid password" }),
            };
        }

        console.log("Password is valid, generating JWT token...");

        const userId = user.Item.userId;

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("JWT secret is not set in environment variables");
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Internal server error" }),
            };
        }

        token = await new SignJWT({ userId })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('1h')
            .sign(new TextEncoder().encode(secret));

        console.log("JWT token generated successfully");


    } catch (error) {
        console.error("Error during login process:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal server error" }),
        };
    }

    return {
        statusCode: 200,
        headers: {
            "Set-Cookie": `token=${token}; HttpOnly; Path=/; Max-Age=3600; Secure; SameSite=Strict`,
        },
        body: JSON.stringify({ message: "Login successful" }),
    }
}