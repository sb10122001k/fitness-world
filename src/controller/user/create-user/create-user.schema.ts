import { Type } from "@sinclair/typebox";


export const CreateUserSchema = Type.Object({
    address: Type.Optional(Type.String()),
    phoneNumber: Type.String(),
    adharNumber: Type.Optional(Type.String()),
    avatarUrl: Type.Optional(Type.String()),
    name: Type.String(),
});
