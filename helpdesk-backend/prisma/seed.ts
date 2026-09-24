import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    const password = await bcrypt.hash('Admin@123456', 10);

    const admin = await prisma.user.upsert({
        where: {
            email: 'admin@helpdesk.com',
        },
        update: {},
        create: {
            name: 'System Admin',
            email: 'admin@helpdesk.com',
            password,
            role: 'ADMIN',
            status: 'ACTIVE',
        },
    });

    console.log('Admin account created:', admin.email);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });