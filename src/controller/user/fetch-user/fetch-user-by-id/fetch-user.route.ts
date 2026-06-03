import { asyncRoute } from "../../../../server/async-route";
import { Route } from "../../../../server/route";
import { $prisma } from "../../../../service.ts/prisma";
import { fromPrismaUserWithPaymentLogs } from "../../../../utils/user/user-mapper";
import { CAN_MANAGE_USER } from "../../../../middleware/auth";

export const FetchUserByIdRoute: Route = {
    method: "get",
    route: "/admin/:adminId/user/:userId",
    docs: {
        tags: ["User"],
        description: "Fetch user by ID",
        security: [{ SessionToken: [] }],
        parameters: [
            {
                in: "path",
                name: "adminId",
                required: true,
                type: "string",
                description: "ID of the admin",
            },
            {
                in: "path",
                name: "userId",
                required: true,
                type: "string",
                description: "ID of the user to fetch",
            },
            {
                in: "query",
                name: "limit",
                schema: { type: "number" },
                description: "Number of payment logs to return",
            },
            {
                in: "query",
                name: "offset",
                schema: { type: "number" },
                description: "Number of payment logs to skip",
            },
        ],
        responses: {
            200: {
                description: "User fetched successfully",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                id: { type: "string" },
                                name: { type: "string" },
                                phoneNumber: { type: "string" },
                                adminId: { type: "string" },
                                paymentLogs: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            id: { type: "string" },
                                            amount: { type: "number" },
                                            gymExipriDate: { type: "string", format: "date-time" },
                                            userId: { type: "string" },
                                            createdAt: { type: "string", format: "date-time" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            404: {
                description: "User not found",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                message: { type: "string" },
                            },
                        },
                    },
                },
            },
        },
    },
    handler: [
        CAN_MANAGE_USER,
        asyncRoute(async (req, res) => {
            const { adminId, userId } = req.params;

            const user = await $prisma.user.findFirstOrThrow({
                where: {
                    id: userId as string,
                    adminId: adminId as string,
                },
                include: {
                    paymentLogs: {
                        orderBy: {
                            gymExipriDate: "desc",
                        },
                    },
                },
            });

            return res.status(200).json(fromPrismaUserWithPaymentLogs(user));
        }),
    ],
};