import { Route } from "../../../server/route";
import { asyncRoute } from "../../../server/async-route";
import { $prisma } from "../../../service.ts/prisma";
import { CreateUserSchema } from "../create-user/create-user.schema";
import { fromPrismaUserWithPaymentLogs } from "../../../utils/user/user-mapper";
import { CAN_MANAGE_USER } from "../../../middleware/auth";

export const UpdateUserRoute: Route = {
    method: "put",
    route: "/admin/:adminId/user/:userId",
    docs: {
        tags: ["User"],
        description: "Update user",
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
                description: "ID of the user to update",
            },
        ],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: CreateUserSchema as any,
                },
            },
        },
        responses: {
            200: {
                description: "User updated successfully",
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
                                            gymExpiryDate: { type: "string", format: "date-time" },
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

            const existingUser = await $prisma.user.findFirst({
                where: {
                    id: userId as string,
                    adminId: adminId as string,
                },
            });

            if (!existingUser) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            const updatedUser = await $prisma.user.update({
                where: {
                    id: userId as string,
                },
                data: {
                    ...req.body,
                },
                include: {
                    paymentLogs: {
                        orderBy: {
                            gymExpiryDate: "desc",
                        },
                    },
                },
            });

            return res.status(200).json(fromPrismaUserWithPaymentLogs(updatedUser));
        }),
    ],
};