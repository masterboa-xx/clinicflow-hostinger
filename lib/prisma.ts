import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prismaClientOptions: any = {
    log: ["error", "warn"],
};

if (process.env.DATABASE_URL) {
    prismaClientOptions.datasources = {
        db: {
            url: process.env.DATABASE_URL.replace("localhost", "127.0.0.1"),
        },
    };
}

export const prisma = globalForPrisma.prisma || new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
