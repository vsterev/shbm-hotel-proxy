import { Request, Response, NextFunction } from "express";
import envVariables from "../config/envVariables";

export async function expressAuthentication(
    request: Request,
    securityName: string,
): Promise<any> {
    if (["main", "partner"].includes(securityName)) {
        const token = request.headers["authorization"]?.split(" ")[1];

        return new Promise((resolve, reject) => {
            if (!token) {
                const error = new Error("No token provided");
                return reject(error);
            }

            const key = `API_TOKEN_${securityName.toUpperCase()}` as keyof typeof envVariables;

            if (token === envVariables[key]) {
                return resolve({ name: "Main" });
            } else if (token === envVariables[key]) {
                return resolve({ name: "Partner" });
            } else {
                const error = new Error("Invalid token");
                reject(error);
            }
        })
    }
    return Promise.reject("Unknown security");
}
