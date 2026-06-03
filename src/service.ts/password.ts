import bcrypt from "bcrypt";

export const $password = {
    async hash(plain: string): Promise<string> {
        return bcrypt.hash(plain, 10);
    },

    async compare(plain: string, hashed: string): Promise<boolean> {
        return await bcrypt.compare(plain, hashed);
    },
};
