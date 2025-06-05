import { APIGatewayProxyHandler } from "aws-lambda";
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";
import { dynamodb } from "../lib/dynamoClient";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

export const submitRequest: APIGatewayProxyHandler = async (event) => {
    const body = JSON.parse(event.body || "{}");
    if (!body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Request body is required" }),
        };
    }
    if (!body.tenantId || !body.message || !body.timestamp) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "tenantId, message, and timestamp are required" }),
        };
    }

    const { tenantId, message, timestamp } = body;

    const analysisResult = await fetch(`http://localhost:3000/analysis`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
    });

    if (!analysisResult.ok) {
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

    if (!analysisData || !analysisData.keywords || !analysisData.urgencyIndicators || !analysisData.priorityScore) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Invalid analysis data" }),
        };
    }

    const requestId = uuidv4();

    const priority = analysisData.priorityScore >= 0.6 ? "high" : analysisData.priorityScore >= 0.3 ? "medium" : "low";

    const requestData = {
        requestId,
        tenantId,
        message,
        timestamp,
        priority
    };

    await dynamodb.send(new PutCommand({
        TableName: "TenantRequests",
        Item: requestData,
    }));

    return {
        statusCode: 200,
        body: JSON.stringify(requestId),
    };
};
