import { PaymentLog, User } from "@prisma/client";
import { asyncRoute } from "../../../server/async-route";
import { Route } from "../../../server/route";
import { $prisma } from "../../../service.ts/prisma";
import { fromPrismaUser } from "../../../utils/user/user-mapper";
import { CAN_MANAGE_USER } from "../../../middleware/auth";

export const FetchUserRoute: Route = {
    method: "get",
    route: "/admin/:adminId/user",
    docs: {
        tags: ["User"],
        description: "Fetch all users under an admin",
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
                in: "query",
                name: "limit",
                schema: { type: "number" },
                description: "Number of users to return",
            },
            {
                in: "query",
                name: "offset",
                schema: { type: "number" },
                description: "Number of users to skip",
            },
        ],
        responses: {
            200: {
                description: "Users fetched successfully",
                content: {
                    "application/json": {
                        schema: {
                            type: "array",
                            items: {
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
            },
            404: {
                description: "Admin not found",
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
            const { adminId } = req.params;

            const users: (User & { paymentLogs: PaymentLog[] })[] = await $prisma.$queryRaw`
                SELECT u.*, pl.*
                FROM "User" u
                LEFT JOIN LATERAL (
                    SELECT *
                    FROM "PaymentLog" pl
                    WHERE pl."userId" = u.id
                    ORDER BY pl."expiryDate" DESC
                    LIMIT 1
                ) pl ON true
                WHERE u."adminId" = ${adminId}
                ORDER BY pl."expiryDate" DESC NULLS LAST
                `;

            return res.status(200).json(users.map(fromPrismaUser));
        }),
    ],
};