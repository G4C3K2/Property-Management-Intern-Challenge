import { APIGatewayProxyHandler } from 'aws-lambda';
import { dynamodb } from '../lib/dynamoClient';
import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

export const changeStatus: APIGatewayProxyHandler = async (event) => {
    const { status } = JSON.parse(event.body || "{}");
    const requestId = event.pathParameters?.id;

    if (!status || !requestId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Status and requestId are required" }),
        };
    }

    const request = await dynamodb.send(new GetCommand({
        TableName: "TenantRequests",
        Key: { requestId }
    }));

    if (!request.Item) {
        return {
            statusCode: 404,
            body: JSON.stringify({ error: "Request not found" }),
        };
    } else {
        await dynamodb.send(new UpdateCommand({
            TableName: "TenantRequests",
            Key: { requestId },
            UpdateExpression: "SET #status = :status",
            ExpressionAttributeNames: {
                "#status": "status"
            },
            ExpressionAttributeValues: {
                ":status": status
            },
            ReturnValues: "ALL_NEW"
        }));
    }

    return {
        statusCode: 200,
        body: JSON.stringify(status)
    };

};