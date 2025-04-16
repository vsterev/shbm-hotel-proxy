import express, { NextFunction } from "express";
import bodyParser from "body-parser";
import { RegisterRoutes } from "../build/routes";

import * as swaggerJson from "../build/swagger.json";
import * as swaggerUI from "swagger-ui-express";
import morgan from "morgan";
import config from "./config/envVariables";
import { ValidateError } from "tsoa";

export const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));

RegisterRoutes(app);
app.use(["/openapi", "/docs", "/swagger"], swaggerUI.serve, swaggerUI.setup(swaggerJson));
const port = config.APP_PORT;
app.listen(port, () =>
    console.log(`Example app listening at http://localhost:${port}`)
);


app.use((
    err: unknown,
    req: express.Request,
    res: express.Response,
    next: NextFunction
): void => {
    if (err instanceof ValidateError) {
        console.error("Validation Error:", JSON.stringify(err.fields, null, 2));
        res.status(422).json({
            message: "Validation Failed",
            details: err.fields,
        });
    } else {
        next(err);
    }
});