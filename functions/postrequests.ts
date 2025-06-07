import { APIGatewayProxyHandler } from "aws-lambda";
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";
import { dynamodb } from "../lib/dynamoClient";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

export const submitRequest: APIGatewayProxyHandler = async (event) => {
    console.log("Received event:", JSON.stringify(event));

    const body = JSON.parse(event.body || "{}");
    console.log("Parsed body:", body);

    if (!body) {
        console.log("No body provided in request.");
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Request body is required" }),
        };
    }
    if (!body.tenantId || !body.message || !body.timestamp) {
        console.log("Missing required fields:", {
            tenantId: body.tenantId,
            message: body.message,
            timestamp: body.timestamp
        });
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "tenantId, message, and timestamp are required" }),
        };
    }

    const { tenantId, message, timestamp } = body;
    console.log("tenantId:", tenantId, "message:", message, "timestamp:", timestamp);

    const analysisResult = await fetch(`http://localhost:3000/dev/analyze`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
    });
    console.log("Analysis API response status:", analysisResult.status);

    if (!analysisResult.ok) {
        console.log("Failed to analyze message. Status:", analysisResult.status);
        return {
            statusCode: analysisResult.status,
            body: JSON.stringify({ error: "Failed to analyze message" }),
        };
    }

    const analysisData = await analysisResult.json() as {
        keywords: string[];
        urgencyIndicators: number;
        priorityScore: number;  
    }
    console.log("Analysis data:", analysisData);

    const requestId = uuidv4();
    console.log("Generated requestId:", requestId);

    const priority = analysisData.priorityScore >= 0.6 ? "high" : analysisData.priorityScore >= 0.4 ? "medium" : "low";
    console.log("Calculated priority:", priority);

    const requestData = {
        requestId,
        TenantID: tenantId,
        message,
        timestamp,
        priority,
        status: "unresolved"
    };
    console.log("Request data to be saved:", requestData);

    await dynamodb.send(new PutCommand({
        TableName: "TenantRequests",
        Item: requestData,
    }));
    console.log("Saved request data to DynamoDB.");

    const returedData = {
        requestId,
        priority,
        analysisData
    };
    console.log("Returning data:", returedData);

    return {
        statusCode: 200,
        body: JSON.stringify(returedData),
    };
};
