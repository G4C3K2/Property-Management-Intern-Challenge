import { APIGatewayProxyHandler } from 'aws-lambda';
import { dynamodb } from '../lib/dynamoClient';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { verify } from '../events/verify';

export const getRequest: APIGatewayProxyHandler = async (event) => {
    const priority = event.queryStringParameters?.priority;
    let requests;

    try {
            const payload = await verify(event);
        } catch (error) {
            console.error("Verification failed:", error);
            return {
                statusCode: 401,
                body: JSON.stringify({ error: "Unauthorized" }),
            };
        }

    if (!priority) {
        requests = await dynamodb.send(new ScanCommand({
            TableName: "TenantRequests",
        }));
    }
    else {
        requests = await dynamodb.send(new ScanCommand({
            TableName: "TenantRequests",
            FilterExpression: "priority = :priority",
            ExpressionAttributeValues: {
                ":priority": priority
            }
        }));
    }

    const mappedRequests = requests.Items?.map((item) => ({
        id: item.requestId,
        priority: item.priority,
        message: item.message,
        createdAt: item.timestamp,
        resolved: item.resolved ?? false
    }));


    return {
        statusCode: 200,
        body: JSON.stringify({ requests: mappedRequests })
    };
}