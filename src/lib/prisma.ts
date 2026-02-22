import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const getPrisma = () => {
    if (globalForPrisma.prisma) return globalForPrisma.prisma;

    const libsql = createClient({
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN,
    })

    console.log(`[Database] Initializing Prisma with LibSQL. URL: ${process.env.TURSO_DATABASE_URL?.substring(0, 20)}...`);

    const adapter = new PrismaLibSQL(libsql as any)
    const client = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client;
    return client;
}

export const prisma = getPrisma()

export default prisma
