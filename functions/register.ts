import { APIGatewayProxyHandler } from "aws-lambda";
import { dynamodb } from "../lib/dynamoClient";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

export const registerUser: APIGatewayProxyHandler = async (event) => {
    console.log("⏩ Incoming registration request");

    const body = JSON.parse(event.body || "{}");
    console.log("📥 Parsed request body:", body);

    if (!body || !body.email || !body.firstName || !body.lastName || !body.password) {
        console.warn("⚠️ Missing required fields");
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "email, firstName, lastName, and password are required" }),
        };
    }

    if (
        typeof body.email !== "string" ||
        typeof body.firstName !== "string" ||
        typeof body.lastName !== "string" ||
        typeof body.password !== "string"
    ) {
        console.warn("⚠️ One or more fields are not strings");
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "email, firstName, lastName, and password must be strings" }),
        };
    }

    const { email, firstName, lastName, password } = body;
    console.log("✅ Registration input is valid");
    console.log("🔑 Checking for existing user with email:", email);

    const userId = nanoid(10);
    console.log("🆔 Generated userId:", userId);

    try {
        const existUser = await dynamodb.send(new GetCommand({
            TableName: "Users",
            Key: { email },
        }));

        console.log("🔍 DynamoDB GET result:", existUser);

        if (existUser.Item) {
            console.warn("❌ User already exists with this email:", email);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "User with this email already exists" }),
            };
        }

        console.log("🔐 Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 12);
        console.log("✅ Password hashed successfully");

        const newUser = {
            userId,
            email,
            firstName,
            lastName,
            password: hashedPassword,
        };

        console.log("💾 Saving new user to DynamoDB:", newUser);

        await dynamodb.send(new PutCommand({
            TableName: "Users",
            Item: newUser,
        }));

        console.log("🎉 User registered successfully:", userId);

    } catch (error) {
        console.error("🔥 Error during user registration:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal server error" }),
        };
    }

    return {
        statusCode: 201,
        body: JSON.stringify({
            userId,
            email,
            firstName,
            lastName,
        }),
    };
};
