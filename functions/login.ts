import { APIGatewayProxyHandler } from 'aws-lambda';
import { dynamodb } from '../lib/dynamoClient';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export const loginTenant: APIGatewayProxyHandler = async (event) => {
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
    console.log("Checking for existing tenant with email:", email);

    try {
        const tenant = await dynamodb.send(new GetCommand({
            TableName: "Tenants",
            Key: { email },
        }));

        if (!tenant.Item) {
            console.warn("Tenant not found with email:", email);
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "Tenant not found" }),
            };
        }

        console.log("Tenant found:", tenant.Item);

        const isPasswordValid = await bcrypt.compare(password, tenant.Item.password);

        if (!isPasswordValid) {
            console.warn("Invalid password for email:", email);
            return {
                statusCode: 401,
                body: JSON.stringify({ error: "Invalid password" }),
            };
        }

        console.log("Password is valid, generating JWT token...");

        const tenantId = tenant.Item.tenantId;

        const token = await new SignJWT({ tenantId })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('1h')
            .sign(new TextEncoder().encode(process.env.JWT_SECRET));

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
        body: JSON.stringify({ message: "Login successful" }),
    }
}