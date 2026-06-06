import { asyncRoute } from "../../../server/async-route";
import { Route } from "../../../server/route";
import { $prisma } from "../../../service.ts/prisma";
import { CAN_MANAGE_USER } from "../../../middleware/auth";

export const CreatePaymentLogRoute: Route = {
    method: "post",
    route: "/admin/:adminId/user/:userId/payment-log",
    docs: {
        tags: ["Payment Log"],
        description: "Create a new payment log for a user",
        responses: {
            201: {
                description: "Payment log created successfully",
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
                description: "Bad request",
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
            const { amount, gymExpiryDate, cardioAdded } = req.body;
            if (!amount || !gymExpiryDate) {
                return res.status(400).json({
                    message: "Amount and gym expiry date are required",
                });
            }

            const user = await $prisma.user.findFirst({
                where: {
                    id: req.params.userId as string,
                    adminId: req.params.adminId as string,
                },
            });

            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            await $prisma.paymentLog.create({
                data: {
                    amount: amount as number,
                    gymExpiryDate: new Date(gymExpiryDate as string),
                    cardioAdded: cardioAdded as boolean,
                    userId: user.id,
                },
            });

            return res.status(201).json({
                message: "Payment log created successfully",
            });
        }),
    ],
};
