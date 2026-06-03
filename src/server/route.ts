import { RequestHandler } from "express";
import { JsonSchema } from "@bahatron/utils/lib/json-schema";


export interface Route {
    method: "post" | "get" | "put" | "patch" | "delete";
    route: string;
    handler: RequestHandler | RequestHandler[];
    docs?: {
        tags?: string[];
        description?: string;
        security?: Record<"SessionToken", []>[];
        parameters?: {
            in: "path" | "query" | "header";
            name: string;
            required?: true;
            type?: "string" | "number";
            schema?: JsonSchema;
            description?: string;
        }[];
        requestBody?: {
            required?: boolean;
            content: {
                "application/json": {
                    schema: JsonSchema;
                };
            } | {
                "multipart/form-data": {
                    schema: JsonSchema;
                };
            };
        };
        responses?: {
            [k: number]: {
                description?: string;
                content: {
                    "application/json": {
                        schema: JsonSchema;
                    };
                };
            };
        };
        schemas?: {
            [k: string]: JsonSchema;
        };
    };
}
