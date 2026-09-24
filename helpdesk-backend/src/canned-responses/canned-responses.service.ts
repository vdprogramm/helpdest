import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateCannedResponseDto } from './dto/create-canned-response.dto';
import { UpdateCannedResponseDto } from './dto/update-canned-response.dto';

@Injectable()
export class CannedResponsesService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async create(
        userId: string,
        dto: CreateCannedResponseDto,
    ) {
        if (dto.departmentId) {
            const department =
                await this.prisma.department.findUnique({
                    where: {
                        id: dto.departmentId,
                    },
                });

            if (!department) {
                throw new NotFoundException(
                    'Department không tồn tại',
                );
            }

            if (!department.status) {
                throw new BadRequestException(
                    'Department đang tạm ngưng',
                );
            }
        }

        const response =
            await this.prisma.cannedResponse.create({
                data: {
                    departmentId:
                        dto.departmentId || null,
                    title: dto.title.trim(),
                    content: dto.content.trim(),
                    createdById: userId,
                },
                include: {
                    department: true,
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

        return response;
    }

    async findAll(
        departmentId?: string,
    ) {
        return this.prisma.cannedResponse.findMany({
            where: departmentId
                ? {
                    departmentId,
                }
                : undefined,

            include: {
                department: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },

            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string) {
        const response =
            await this.prisma.cannedResponse.findUnique({
                where: {
                    id,
                },
                include: {
                    department: true,
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

        if (!response) {
            throw new NotFoundException(
                'Canned Response không tồn tại',
            );
        }

        return response;
    }

    async update(
        id: string,
        dto: UpdateCannedResponseDto,
    ) {
        await this.findOne(id);

        if (dto.departmentId) {
            const department =
                await this.prisma.department.findUnique({
                    where: {
                        id: dto.departmentId,
                    },
                });

            if (!department) {
                throw new NotFoundException(
                    'Department không tồn tại',
                );
            }

            if (!department.status) {
                throw new BadRequestException(
                    'Department đang tạm ngưng',
                );
            }
        }

        return this.prisma.cannedResponse.update({
            where: {
                id,
            },
            data: {
                departmentId:
                    dto.departmentId !== undefined
                        ? dto.departmentId
                        : undefined,

                title:
                    dto.title !== undefined
                        ? dto.title.trim()
                        : undefined,

                content:
                    dto.content !== undefined
                        ? dto.content.trim()
                        : undefined,
            },

            include: {
                department: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        await this.prisma.cannedResponse.delete({
            where: {
                id,
            },
        });

        return {
            message: 'Đã xóa Canned Response',
        };
    }

    // Lấy câu trả lời mẫu dành cho Department
    async findByDepartment(
        departmentId: string,
    ) {
        const department =
            await this.prisma.department.findUnique({
                where: {
                    id: departmentId,
                },
            });

        if (!department) {
            throw new NotFoundException(
                'Department không tồn tại',
            );
        }

        return this.prisma.cannedResponse.findMany({
            where: {
                OR: [
                    {
                        departmentId,
                    },
                    {
                        departmentId: null,
                    },
                ],
            },

            select: {
                id: true,
                title: true,
                content: true,
                departmentId: true,
            },

            orderBy: {
                title: 'asc',
            },
        });
    }
}