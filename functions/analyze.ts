import { APIGatewayProxyHandler } from "aws-lambda";
import { analyze } from "../lib/analyzeLogic";

export const analysis: APIGatewayProxyHandler = async (event) => {
    const { message } = JSON.parse(event.body || "{}");

    if (!message) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Message is required" }),
        };
    }

    const analysis = analyze(message);

    return {
        statusCode: 200,
        body: JSON.stringify(analysis),
    };
};