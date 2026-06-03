import { JsonSchema } from "@bahatron/utils/lib/json-schema";
import { Route } from "../../../server/route";
import { asyncRoute } from "../../../server/async-route";
import { $prisma } from "../../../service.ts/prisma";
import { $session } from "../../../service.ts/session";
import { $password } from "../../../service.ts/password";

export const LoginAdminRoute: Route = {
  method: "post",
  route: "/admin/login",
  docs: {
    tags: ["Admin"],
    description: "Admin login",
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
    responses: {
      200: {
        description: "Login successful",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: { type: "string" },
                token: { type: "string" },
                admin: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    phoneNumber: { type: "string" },
                    isApproved: { type: "boolean" },
                  },
                },
              },
            } as JsonSchema,
          },
        },
      },
      401: {
        description: "Invalid credentials",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: { type: "string" },
              },
            } as JsonSchema,
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
            } as JsonSchema,
          },
        },
      },
    },
  },
  handler: [
    asyncRoute(async (req, res) => {
      const { phoneNumber, password } = req.body;

      const admin = await $prisma.admin.findUnique({
        where: {
          phoneNumber,
        },
      });

      if (!admin) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      const validPassword = await $password.compare(password, admin.password);

      if (!validPassword) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      if (!admin.isApproved) {
        return res.status(403).json({
          message: "Admin is not approved",
        });
      }

      const token = $session.toSessionToken(admin);

      return res.status(200).json({
        message: "Login successful",
        token,
        admin: {
          id: admin.id,
          phoneNumber: admin.phoneNumber,
          isApproved: admin.isApproved,
        },
      });
    }),
  ],
};
