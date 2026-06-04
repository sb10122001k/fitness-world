import { AsyncLocalStorage } from "async_hooks";
import { SignOptions } from "jsonwebtoken";
import { Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

import { $jwt } from "./jwt";
import { $prisma } from "./prisma";
import { pickBy } from "lodash";
import { Admin } from "@prisma/client";


export type SessionToken = Static<typeof SessionTokenSchema>;

export const SessionTokenSchema = Type.Object(
    {
        user_id: Type.String(),
    },
    {
        additionalProperties: true,
    },
);

// ======================================================
// Async Context Replacement
// ======================================================

const asyncStorage = new AsyncLocalStorage<Map<string, unknown>>();

export const AsyncContext = {
    run<T>(callback: () => T): T {
        return asyncStorage.run(new Map(), callback);
    },

    set(key: string, value: unknown): void {
        asyncStorage.getStore()?.set(key, value);
    },

    get<T>(key: string): T | undefined {
        return asyncStorage.getStore()?.get(key) as T | undefined;
    },
};

// ======================================================
// Error Helpers Replacement
// ======================================================

export const Forbidden = (message = "Forbidden") => {
    const error = new Error(message);
    (error as any).statusCode = 403;
    return error;
};

export const Unauthorized = (message = "Unauthorized") => {
    const error = new Error(message);
    (error as any).statusCode = 401;
    return error;
};

// ======================================================
// Session Service
// ======================================================

const REQUEST_USER = "request_session";

export const $session = {
    async getUserFromToken(token: string): Promise<Admin> {
        const session = $jwt.verify(token);

        if (!Value.Check(SessionTokenSchema, session)) {
            throw Forbidden("invalid session token");
        }

        const user = await $prisma.admin.findUnique({
            where: {
                id: session.user_id,
            },
        });

        if (!user || user.isApproved === false) {
            throw Unauthorized();
        }

        return user;
    },

    toSessionToken(
        user: Admin,
        options: SignOptions = {},
    ): string {
        const DEFAULT_OPTIONS: SignOptions = {
            expiresIn: 900, // 15 minutes
        };

        const jwtOptions = pickBy(
            {
                ...DEFAULT_OPTIONS,
                ...options,
            },
            (value) => value !== undefined && value !== null,
        ) as SignOptions;

        const session: SessionToken = {
            user_id: user.id,
        };

        return $jwt.sign(session, jwtOptions);
    },

    async setSession(token: string): Promise<Admin> {
        const user = await this.getUserFromToken(token);

        this.setSessionUser(user);

        return user;
    },

    setSessionUser(user: Admin): void {
        AsyncContext.set(REQUEST_USER, user);
    },

    getSessionUser(): Admin | undefined {
        return AsyncContext.get<Admin>(REQUEST_USER);
    },

    getSessionUserOrFail(): Admin {
        const user = this.getSessionUser();

        if (!user || user.isApproved === false) {
            throw Unauthorized();
        }

        return user;
    },
};