import { CAN_MANAGE_USER } from "../../../middleware/auth";
import { Route } from "../../../server/route";
import { $prisma } from "../../../service.ts/prisma";
import { fromPrismaUserWithPaymentLogs } from "../../../utils/user/user-mapper";
import { CreateUserSchema } from "./create-user.schema";

export const CreateUserRoute: Route = {
    method: "post",
    route: "/admin/:adminId/user",
    docs: {
        tags: ["User"],
        description: "Create a new user",
        security: [{ SessionToken: [] }],
        parameters: [
            {
                in: "path",
                name: "adminId",
                required: true,
                type: "string",
                description: "ID of the admin creating the user",
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
                description: "User created successfully",
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
            400: {
                description: "Validation error",
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
            403: {
                description: "Admin not approved",
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
        async (req, res) => {
            const { adminId } = req.params;
            const { phoneNumber, name } = req.body;

            const admin = await $prisma.admin.findUnique({
                where: {
                    id: adminId as string,
                },
            });

            if (!admin) {
                return res.status(404).json({
                    message: "Admin not found",
                });
            }

            if (!admin.isApproved) {
                return res.status(403).json({
                    message: "Admin not approved",
                });
            }

            if (!phoneNumber || !name) {
                return res.status(400).json({
                    message: "Phone number and name are required",
                });
            }

            const user = await $prisma.user.create({
                data: {
                    adminId: admin.id,
                    ...req.body,
                },
                include: {
                    paymentLogs: {
                        orderBy: {
                            gymExipriDate: "desc",
                        },
                    },
                },
            });

            res.status(200).json(fromPrismaUserWithPaymentLogs(user));
        },
    ],
};