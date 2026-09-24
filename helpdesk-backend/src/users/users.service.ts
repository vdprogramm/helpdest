import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';

import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { UpdateAgentStatusDto } from './dto/update-agent-status.dto';

@Injectable()
export class UsersService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async createAgent(
        createAgentDto: CreateAgentDto,
    ) {
        const {
            name,
            email,
            password,
        } = createAgentDto;

        const existingUser =
            await this.prisma.user.findUnique({
                where: {
                    email,
                },
            });

        if (existingUser) {
            throw new ConflictException(
                'Email đã được sử dụng',
            );
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const agent =
            await this.prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: 'AGENT',
                    status: 'ACTIVE',
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    isOnline: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

        return {
            message: 'Tạo Agent thành công',
            agent,
        };
    }

    async findAllAgents() {
        const agents =
            await this.prisma.user.findMany({
                where: {
                    role: 'AGENT',
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    isOnline: true,
                    createdAt: true,
                    updatedAt: true,
                    agentDepartments: {
                        select: {
                            department: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

        return {
            total: agents.length,
            agents,
        };
    }

    async findAgentById(id: string) {
        const agent =
            await this.prisma.user.findFirst({
                where: {
                    id,
                    role: 'AGENT',
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    isOnline: true,
                    createdAt: true,
                    updatedAt: true,
                    agentDepartments: {
                        select: {
                            department: {
                                select: {
                                    id: true,
                                    name: true,
                                    description: true,
                                    status: true,
                                },
                            },
                        },
                    },
                },
            });

        if (!agent) {
            throw new NotFoundException(
                'Không tìm thấy Agent',
            );
        }

        return agent;
    }

    async updateAgent(
        id: string,
        updateAgentDto: UpdateAgentDto,
    ) {
        const agent =
            await this.prisma.user.findFirst({
                where: {
                    id,
                    role: 'AGENT',
                },
            });

        if (!agent) {
            throw new NotFoundException(
                'Không tìm thấy Agent',
            );
        }

        if (
            updateAgentDto.email &&
            updateAgentDto.email !== agent.email
        ) {
            const existingUser =
                await this.prisma.user.findUnique({
                    where: {
                        email: updateAgentDto.email,
                    },
                });

            if (existingUser) {
                throw new ConflictException(
                    'Email đã được sử dụng',
                );
            }
        }

        const data: {
            name?: string;
            email?: string;
            password?: string;
        } = {};

        if (updateAgentDto.name !== undefined) {
            data.name = updateAgentDto.name;
        }

        if (updateAgentDto.email !== undefined) {
            data.email = updateAgentDto.email;
        }

        if (updateAgentDto.password !== undefined) {
            data.password = await bcrypt.hash(
                updateAgentDto.password,
                10,
            );
        }

        const updatedAgent =
            await this.prisma.user.update({
                where: {
                    id,
                },
                data,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    isOnline: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

        return {
            message: 'Cập nhật Agent thành công',
            agent: updatedAgent,
        };
    }

    async updateAgentStatus(
        id: string,
        updateAgentStatusDto: UpdateAgentStatusDto,
    ) {
        const agent =
            await this.prisma.user.findFirst({
                where: {
                    id,
                    role: 'AGENT',
                },
            });

        if (!agent) {
            throw new NotFoundException(
                'Không tìm thấy Agent',
            );
        }

        const updatedAgent =
            await this.prisma.user.update({
                where: {
                    id,
                },
                data: {
                    status: updateAgentStatusDto.status,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    isOnline: true,
                    updatedAt: true,
                },
            });

        return {
            message:
                updateAgentStatusDto.status === 'ACTIVE'
                    ? 'Đã kích hoạt Agent'
                    : 'Đã khóa Agent',
            agent: updatedAgent,
        };
    }

    async deleteAgent(id: string) {
        const agent =
            await this.prisma.user.findFirst({
                where: {
                    id,
                    role: 'AGENT',
                },
            });

        if (!agent) {
            throw new NotFoundException(
                'Không tìm thấy Agent',
            );
        }

        await this.prisma.user.delete({
            where: {
                id,
            },
        });

        return {
            message: 'Xóa Agent thành công',
        };
    }
}