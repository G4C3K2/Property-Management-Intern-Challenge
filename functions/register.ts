import { APIGatewayProxyHandler } from "aws-lambda";
import { dynamodb } from "../lib/dynamoClient";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

export const registerTenant: APIGatewayProxyHandler = async (event) => {
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
    console.log("🔑 Checking for existing tenant with email:", email);

    const tenantId = nanoid(10);
    console.log("🆔 Generated tenantId:", tenantId);

    try {
        const existTenant = await dynamodb.send(new GetCommand({
            TableName: "Tenants",
            Key: { email },
        }));

        console.log("🔍 DynamoDB GET result:", existTenant);

        if (existTenant.Item) {
            console.warn("❌ Tenant already exists with this email:", email);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Tenant with this email already exists" }),
            };
        }

        console.log("🔐 Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 12);
        console.log("✅ Password hashed successfully");

        const newTenant = {
            tenantId,
            email,
            firstName,
            lastName,
            password: hashedPassword,
        };

        console.log("💾 Saving new tenant to DynamoDB:", newTenant);

        await dynamodb.send(new PutCommand({
            TableName: "Tenants",
            Item: newTenant,
        }));

        console.log("🎉 Tenant registered successfully:", tenantId);

    } catch (error) {
        console.error("🔥 Error during tenant registration:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal server error" }),
        };
    }

    return {
        statusCode: 201,
        body: JSON.stringify({
            tenantId,
            email,
            firstName,
            lastName,
        }),
    };
};
