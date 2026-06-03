import { JsonSchema } from "@bahatron/utils/lib/json-schema";
import { Route } from "./route";


export const createSwaggerDocs = ({
    routes,
    info,
}: {
    routes: Route[];
    info?: {
        title?: string;
        description?: string;
        version?: string;
    };
}) => {
    return {
        openapi: "3.0.0",
        info,

        servers: [
            {
                url: '/',
            },
        ],

        paths: toSwaggerPaths(routes),

        components: {
            securitySchemes: {
                SessionToken: {
                    in: "header",
                    name: "Authorization",
                    type: "apiKey",
                },
            },

            schemas: routes.reduce((partial, route) => {
                return {
                    ...partial,
                    ...route.docs?.schemas,
                };
            }, {} as Record<string, JsonSchema>),
        },
    };
};

function toSwaggerPaths(routes: Route[]) {
    return routes.reduce((carry, route) => {
        let path = route.route
            .split("/")
            .map((bit) => (bit.startsWith(":") ? `{${bit.slice(1)}}` : bit))
            .join("/");

        if (!carry[path]) {
            carry[path] = {} as any;
        }

        carry[path][route.method] = route.docs;

        return carry;
    }, {} as Record<string, Record<Route["method"], Route["docs"]>>);
}
