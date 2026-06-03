import { User,PaymentLog } from "@prisma/client";

export const fromPrismaUser = (user: User & { paymentLogs:PaymentLog[] }) => {
   const expiryDate = user.paymentLogs.filter((log) => log.gymExpiryDate > new Date()).map((log) => log.gymExpiryDate).sort((a, b) => b.getTime() - a.getTime())[0];
    return {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        address: user.address,
        adharNumber: user.adharNumber,
        avatarUrl: user.avatarUrl,
        expiryDate: expiryDate ? expiryDate.toISOString() : null,
    };

}

export const fromPrismaUserWithPaymentLogs = (user: User & { paymentLogs:PaymentLog[] }) => {
    return {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        address: user.address,
        adharNumber: user.adharNumber,
        avatarUrl: user.avatarUrl,
        paymentLogs: user.paymentLogs.map((log) => ({
            id: log.id,
            amount: log.amount,
            gymExpiryDate: log.gymExpiryDate.toISOString(),
            createdAt: log.createdAt.toISOString(),
        })),
    };

}