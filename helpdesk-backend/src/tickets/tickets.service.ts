import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async create(
        createTicketDto: CreateTicketDto,
    ) {
        const {
            customerId,
            departmentId,
            assignedAgentId,
            subject,
            priority,
        } = createTicketDto;

        const customer =
            await this.prisma.customer.findUnique({
                where: {
                    id: customerId,
                },
            });

        if (!customer) {
            throw new NotFoundException(
                'Không tìm thấy Customer',
            );
        }

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

        if (!department.status) {
            throw new ConflictException(
                'Department đang bị vô hiệu hóa',
            );
        }

        if (assignedAgentId) {
            await this.validateAgent(
                assignedAgentId,
                departmentId,
            );
        }

        const ticket =
            await this.prisma.ticket.create({
                data: {
                    customerId,
                    departmentId,
                    assignedAgentId,
                    subject,
                    priority: priority ?? 'MEDIUM',
                    status: 'OPEN',
                },

                select: {
                    id: true,
                    subject: true,
                    priority: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,

                    customer: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },

                    department: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },

                    assignedAgent: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

        return {
            message: 'Tạo Ticket thành công',
            ticket,
        };
    }

    async findAll() {
        const tickets =
            await this.prisma.ticket.findMany({
                select: {
                    id: true,
                    subject: true,
                    priority: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    closedAt: true,

                    customer: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },

                    department: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },

                    assignedAgent: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            isOnline: true,
                        },
                    },
                },

                orderBy: {
                    createdAt: 'desc',
                },
            });

        return {
            total: tickets.length,
            tickets,
        };
    }

    async findOne(id: string) {
        const ticket =
            await this.prisma.ticket.findUnique({
                where: {
                    id,
                },

                select: {
                    id: true,
                    subject: true,
                    priority: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    closedAt: true,

                    customer: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            avatar: true,
                        },
                    },

                    department: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                        },
                    },

                    assignedAgent: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            isOnline: true,
                        },
                    },

                    conversation: {
                        select: {
                            id: true,
                            status: true,
                            startedAt: true,
                            endedAt: true,
                        },
                    },
                },
            });

        if (!ticket) {
            throw new NotFoundException(
                'Không tìm thấy Ticket',
            );
        }

        return ticket;
    }

    async update(
        id: string,
        updateTicketDto: UpdateTicketDto,
    ) {
        const ticket =
            await this.prisma.ticket.findUnique({
                where: {
                    id,
                },
            });

        if (!ticket) {
            throw new NotFoundException(
                'Không tìm thấy Ticket',
            );
        }


        if (updateTicketDto.status) {
            this.validateStatusTransition(
                ticket.status,
                updateTicketDto.status,
            );
        }

        const data: {
            priority?: UpdateTicketDto['priority'];
            status?: UpdateTicketDto['status'];
            closedAt?: Date | null;
        } = {};

        if (
            updateTicketDto.priority !== undefined
        ) {
            data.priority =
                updateTicketDto.priority;
        }


        if (
            updateTicketDto.status !== undefined
        ) {
            data.status =
                updateTicketDto.status;

            // Chỉ CLOSED mới có closedAt
            if (
                updateTicketDto.status === 'CLOSED'
            ) {
                data.closedAt = new Date();
            }

            // Các trạng thái khác không phải CLOSED
            // thì chưa đóng Ticket
            else {
                data.closedAt = null;
            }
        }

        const updatedTicket =
            await this.prisma.ticket.update({
                where: {
                    id,
                },

                data,

                select: {
                    id: true,
                    subject: true,
                    priority: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    closedAt: true,

                    customer: {
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

                    assignedAgent: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

        return {
            message: 'Cập nhật Ticket thành công',
            ticket: updatedTicket,
        };
    }

    private validateStatusTransition(
        currentStatus: string,
        newStatus: string,
    ) {
        if (currentStatus === newStatus) {
            return;
        }

        const allowedTransitions: Record<
            string,
            string[]
        > = {
            OPEN: [
                'IN_PROGRESS',
                'CLOSED',
            ],

            IN_PROGRESS: [
                'WAITING',
                'RESOLVED',
                'CLOSED',
            ],

            WAITING: [
                'IN_PROGRESS',
                'CLOSED',
            ],

            RESOLVED: [
                'CLOSED',
            ],

            CLOSED: [],
        };

        const allowed =
            allowedTransitions[currentStatus] ?? [];

        if (!allowed.includes(newStatus)) {
            throw new ConflictException(
                `Không thể chuyển Ticket từ ${currentStatus} sang ${newStatus}`,
            );
        }
    }

    async assignAgent(
        ticketId: string,
        agentId: string,
    ) {
        const ticket =
            await this.prisma.ticket.findUnique({
                where: {
                    id: ticketId,
                },
            });

        if (!ticket) {
            throw new NotFoundException(
                'Không tìm thấy Ticket',
            );
        }

        await this.validateAgent(
            agentId,
            ticket.departmentId,
        );

        const updatedTicket =
            await this.prisma.ticket.update({
                where: {
                    id: ticketId,
                },

                data: {
                    assignedAgentId: agentId,
                    status: 'IN_PROGRESS',
                },

                select: {
                    id: true,
                    subject: true,
                    priority: true,
                    status: true,

                    assignedAgent: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

        return {
            message: 'Đã gán Agent cho Ticket',
            ticket: updatedTicket,
        };
    }

    private async validateAgent(
        agentId: string,
        departmentId: string,
    ) {
        const agent =
            await this.prisma.user.findFirst({
                where: {
                    id: agentId,
                    role: 'AGENT',
                    status: 'ACTIVE',
                },
            });

        if (!agent) {
            throw new NotFoundException(
                'Agent không tồn tại hoặc đang bị khóa',
            );
        }

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
            throw new ConflictException(
                'Agent không thuộc Department của Ticket',
            );
        }
    }
}