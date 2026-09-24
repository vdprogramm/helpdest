import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { UpdateDepartmentStatusDto } from './dto/update-department-status.dto';

@Injectable()
export class DepartmentsService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async create(
        createDepartmentDto: CreateDepartmentDto,
    ) {
        const {
            name,
            description,
        } = createDepartmentDto;

        const existingDepartment =
            await this.prisma.department.findUnique({
                where: {
                    name,
                },
            });

        if (existingDepartment) {
            throw new ConflictException(
                'Tên Department đã tồn tại',
            );
        }

        const department =
            await this.prisma.department.create({
                data: {
                    name,
                    description,
                    status: true,
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

        return {
            message: 'Tạo Department thành công',
            department,
        };
    }

    async findAll() {
        const departments =
            await this.prisma.department.findMany({
                select: {
                    id: true,
                    name: true,
                    description: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,

                    _count: {
                        select: {
                            agentDepartments: true,
                            tickets: true,
                        },
                    },
                },

                orderBy: {
                    createdAt: 'desc',
                },
            });

        return {
            total: departments.length,
            departments,
        };
    }

    async findOne(id: string) {
        const department =
            await this.prisma.department.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,

                    agentDepartments: {
                        select: {
                            agent: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true,
                                    status: true,
                                    isOnline: true,
                                },
                            },
                        },
                    },

                    _count: {
                        select: {
                            tickets: true,
                        },
                    },
                },
            });

        if (!department) {
            throw new NotFoundException(
                'Không tìm thấy Department',
            );
        }

        return department;
    }

    async update(
        id: string,
        updateDepartmentDto: UpdateDepartmentDto,
    ) {
        const department =
            await this.prisma.department.findUnique({
                where: {
                    id,
                },
            });

        if (!department) {
            throw new NotFoundException(
                'Không tìm thấy Department',
            );
        }

        if (
            updateDepartmentDto.name &&
            updateDepartmentDto.name !== department.name
        ) {
            const existingDepartment =
                await this.prisma.department.findUnique({
                    where: {
                        name: updateDepartmentDto.name,
                    },
                });

            if (existingDepartment) {
                throw new ConflictException(
                    'Tên Department đã tồn tại',
                );
            }
        }

        const updatedDepartment =
            await this.prisma.department.update({
                where: {
                    id,
                },
                data: updateDepartmentDto,
                select: {
                    id: true,
                    name: true,
                    description: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

        return {
            message: 'Cập nhật Department thành công',
            department: updatedDepartment,
        };
    }

    async updateStatus(
        id: string,
        updateDepartmentStatusDto: UpdateDepartmentStatusDto,
    ) {
        const department =
            await this.prisma.department.findUnique({
                where: {
                    id,
                },
            });

        if (!department) {
            throw new NotFoundException(
                'Không tìm thấy Department',
            );
        }

        const updatedDepartment =
            await this.prisma.department.update({
                where: {
                    id,
                },
                data: {
                    status:
                        updateDepartmentStatusDto.status,
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    status: true,
                    updatedAt: true,
                },
            });

        return {
            message:
                updateDepartmentStatusDto.status
                    ? 'Đã kích hoạt Department'
                    : 'Đã vô hiệu hóa Department',

            department: updatedDepartment,
        };
    }

    async remove(id: string) {
        const department =
            await this.prisma.department.findUnique({
                where: {
                    id,
                },
            });

        if (!department) {
            throw new NotFoundException(
                'Không tìm thấy Department',
            );
        }

        await this.prisma.department.delete({
            where: {
                id,
            },
        });

        return {
            message: 'Xóa Department thành công',
        };
    }
    async assignAgent(
        departmentId: string,
        agentId: string,
    ) {
        const department =
            await this.prisma.department.findUnique({
                where: {
                    id: departmentId,
                },
            });

        if (!department) {
            throw new NotFoundException(
                'Không tìm thấy Department',
            );
        }

        const agent =
            await this.prisma.user.findFirst({
                where: {
                    id: agentId,
                    role: 'AGENT',
                },
            });

        if (!agent) {
            throw new NotFoundException(
                'Không tìm thấy Agent',
            );
        }

        if (agent.status === 'INACTIVE') {
            throw new ConflictException(
                'Không thể gán Agent đang bị khóa',
            );
        }

        const existingAssignment =
            await this.prisma.agentDepartment.findUnique({
                where: {
                    agentId_departmentId: {
                        agentId,
                        departmentId,
                    },
                },
            });

        if (existingAssignment) {
            throw new ConflictException(
                'Agent đã thuộc Department này',
            );
        }

        const assignment =
            await this.prisma.agentDepartment.create({
                data: {
                    agentId,
                    departmentId,
                },
                select: {
                    id: true,
                    createdAt: true,

                    agent: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },

                    department: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

        return {
            message: 'Gán Agent vào Department thành công',
            assignment,
        };
    }

    async removeAgent(
        departmentId: string,
        agentId: string,
    ) {
        const assignment =
            await this.prisma.agentDepartment.findUnique({
                where: {
                    agentId_departmentId: {
                        agentId,
                        departmentId,
                    },
                },
            });

        if (!assignment) {
            throw new NotFoundException(
                'Agent không thuộc Department này',
            );
        }

        await this.prisma.agentDepartment.delete({
            where: {
                agentId_departmentId: {
                    agentId,
                    departmentId,
                },
            },
        });

        return {
            message:
                'Đã bỏ Agent khỏi Department',
        };
    }
}