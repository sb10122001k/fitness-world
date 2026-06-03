import { CAN_MANAGE_USER } from "../../../middleware/auth";
import { asyncRoute } from "../../../server/async-route";
import { Route } from "../../../server/route";
import { $prisma } from "../../../service.ts/prisma";

export const DeleteUserRoute: Route = {
    method: "delete",
    route: "/admin/:adminId/user/:userId",
    docs: {
        tags: ["User"],
        description: "Delete user",
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
                description: "ID of the user to delete",
            },
        ],
        responses: {
            200: {
                description: "User deleted successfully",
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
            const { adminId, userId } = req.params;

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

            await $prisma.user.delete({
                where: {
                    id: userId as string,
                },
            });

            return res.status(200).json({
                message: "User deleted successfully",
            });
        }),
    ],
};