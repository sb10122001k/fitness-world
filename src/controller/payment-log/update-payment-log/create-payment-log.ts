import { asyncRoute } from "../../../server/async-route";
import { Route } from "../../../server/route";
import { $prisma } from "../../../service.ts/prisma";
import { CAN_MANAGE_USER } from "../../../middleware/auth";

export const UpdatePaymentLogRoute: Route = {
    method: "patch",
    route: "/admin/:adminId/user/:userId/payment-log/:paymentLogId",
    docs: {
        tags: ["Payment Log"],
        description: "Update an existing payment log for a user",
        security: [{ SessionToken: [] }],
        parameters: [
            {
                in: "path",
                name: "adminId",
                required: true,
                schema: { type: "string" },
            },
            {
                in: "path",
                name: "userId",
                required: true,
                schema: { type: "string" },
            },
            {
                in: "path",
                name: "paymentLogId",
                required: true,
                schema: { type: "string" },
            },
        ],
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["amount", "gymExipriDate"],
                        properties: {
                            amount: { type: "number" },
                            gymExipriDate: { type: "string", format: "date-time" },
                        },
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Payment log updated successfully",
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
            404: {
                description: "User or payment log not found",
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
            const { adminId, userId, paymentLogId } = req.params;
            const { amount, gymExipriDate } = req.body;

            if (!amount || !gymExipriDate) {
                return res.status(400).json({
                    message: "Amount and gym expiry date are required",
                });
            }

            const user = await $prisma.user.findFirst({
                where: {
                    id: userId as string,
                    adminId: adminId as string,
                },
            });

            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            const paymentLog = await $prisma.paymentLog.findFirst({
                where: {
                    id: paymentLogId as string,
                    userId: user.id,
                },
            });

            if (!paymentLog) {
                return res.status(404).json({
                    message: "Payment log not found",
                });
            }

            await $prisma.paymentLog.update({
                where: {
                    id: paymentLog.id,
                },
                data: {
                    amount: amount as number,
                    gymExipriDate: new Date(gymExipriDate as string),
                },
            });

            return res.status(200).json({
                message: "Payment log updated successfully",
            });
        }),
    ],
};