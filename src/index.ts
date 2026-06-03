import express, { Request, Response ,Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { Route } from './server/route';
import { createSwaggerDocs } from './server/swagger';
import { PingRoute } from './controller/ping/ping.route';
import { apiRoutes } from './controller/index';
import { errorHandler } from './middleware/error-handler';
import "dotenv/config";
import { SESSION_MIDDLEWARE } from './middleware/session';


const app = express();
const port = process.env.PORT || 3000;

const routes:Route[]=[PingRoute,...apiRoutes];

app.use(express.json());
app.use(SESSION_MIDDLEWARE);
const router = Router();

const redoc = require("redoc-express");


 for (let route of routes) {
        router[route.method](route.route, route.handler);
    }
 let swaggerDocs = createSwaggerDocs({
            routes,
            info: {
                title: "Keyzy Gateway",
                description: "A collection of exposed endpoints",
                version: "0.1.0",
            },
        });

        router.get("/", (req, res) => res.redirect("/docs"));
        router.get("/docs/openapi.json", (req, res) => res.json(swaggerDocs));

        router.use("/docs", swaggerUi.serve);
        router.get("/docs", swaggerUi.setup(swaggerDocs));

        router.get(
            "/redoc",
            redoc({
                title: "Redoc OpenAPI",
                specUrl: "/docs/openapi.json",
            }),
        );
app.use(router);
app.use(errorHandler);
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;