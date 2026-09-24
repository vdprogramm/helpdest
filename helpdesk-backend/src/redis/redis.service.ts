import {
    Injectable,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';

import Redis from 'ioredis';

@Injectable()
export class RedisService
    implements OnModuleInit, OnModuleDestroy {
    private readonly client: Redis;

    constructor() {
        this.client = new Redis({
            host:
                process.env.REDIS_HOST ||
                'localhost',

            port: Number(
                process.env.REDIS_PORT ||
                6379,
            ),
        });
    }

    async onModuleInit() {
        await this.client.ping();

        console.log(
            'Redis connected successfully',
        );
    }

    async onModuleDestroy() {
        await this.client.quit();
    }

    getClient() {
        return this.client;
    }

    async set(
        key: string,
        value: string,
    ) {
        return this.client.set(
            key,
            value,
        );
    }

    async get(key: string) {
        return this.client.get(key);
    }

    async del(key: string) {
        return this.client.del(key);
    }
    async deleteByPattern(
        pattern: string,
    ) {
        const keys =
            await this.client.keys(pattern);

        if (keys.length === 0) {
            return 0;
        }

        return this.client.del(...keys);
    }
}