import { JsonSchema } from "@bahatron/utils/lib/json-schema";
import { Route } from "../../../server/route";
import { asyncRoute } from "../../../server/async-route";
import { $prisma } from "../../../service.ts/prisma";
import { $password } from "../../../service.ts/password";

export const CreateAdminRoute: Route = {
    method: "post",
    route: "/admin/create",

    docs: {
        tags: ["Admin"],
        description: "Create a new admin user",
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            phoneNumber: {
                                type: "string",
                            },
                            password: {
                                type: "string",
                            },
                        },
                        required: ["phoneNumber", "password"],
                    } as JsonSchema,
                },
            },
        },
    },
    handler: [
        asyncRoute(async (req, res) => {
            const { phoneNumber, password } = req.body;
            console.log("Creating admin with phone number:", phoneNumber);
            const existingAdmin = await $prisma.admin.findUnique({
                where: {
                    phoneNumber,
                },
            });

            if (existingAdmin) {
                return res.status(409).json({
                    message: "Admin already exists",
                });
            }

            const hashedPassword = await $password.hash(password);

            const admin = await $prisma.admin.create({
                data: {
                    phoneNumber,
                    password: hashedPassword,
                    isApproved: false,
                },
                select: {
                    id: true,
                    phoneNumber: true,
                    createdAt: true,
                },
            });

            return res.status(201).json({
                message: "Admin created successfully",
                admin,
            });
        }),
    ],
};