import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

try {
    prismaInstance = globalForPrisma.prisma || new PrismaClient({ log: ["query"] });
} catch (error) {
    console.error("Prisma Client Init Failed (Safe Mode Active):", error);
    // Create a dummy proxy to prevent immediate crashes on import, 
    // real calls will still fail but app will boot.
    prismaInstance = new Proxy({} as PrismaClient, {
        get(_target, prop) {
            console.warn(`Attempted to access prisma.${String(prop)} but Prisma failed to init.`);
            return () => Promise.reject(new Error("Prisma Client failed to initialize"));
        }
    });
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
