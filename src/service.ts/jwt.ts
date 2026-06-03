import { Unauthorized } from "@bahatron/utils/lib/error";
import jsonwebtoken, { SignOptions } from "jsonwebtoken";

export const $jwt = {
    sign: (
        payload: any,
        options?: SignOptions,
        secret = process.env.JWT_SECRET,
    ) => {
        return jsonwebtoken.sign(payload, secret??"", options);
    },

    verify: (token: string) => {
        try {
            return jsonwebtoken.verify(token, process.env.JWT_SECRET??"");
        } catch (err) {
            throw Unauthorized();
        }
    },
    decode: (token: string) => {
        return jsonwebtoken.decode(token);
    },
};
