import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Injectable()
export class ConversationsService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async create(
        createConversationDto: CreateConversationDto,
    ) {
        const {
            ticketId,
            customerId,
            agentId,
        } = createConversationDto;

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

        if (ticket.customerId !== customerId) {
            throw new ConflictException(
                'Customer không thuộc Ticket này',
            );
        }

        const existingConversation =
            await this.prisma.conversation.findUnique({
                where: {
                    ticketId,
                },
            });

        if (existingConversation) {
            throw new ConflictException(
                'Ticket đã có Conversation',
            );
        }

        if (agentId) {
            await this.validateAgent(
                agentId,
                ticket.departmentId,
            );
        }

        const conversation =
            await this.prisma.conversation.create({
                data: {
                    ticketId,
                    customerId,
                    agentId,
                    status: 'ACTIVE',
                },

                select: {
                    id: true,
                    ticketId: true,
                    customerId: true,
                    agentId: true,
                    status: true,
                    startedAt: true,
                    endedAt: true,

                    ticket: {
                        select: {
                            id: true,
                            subject: true,
                            priority: true,
                            status: true,
                        },
                    },

                    customer: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },

                    agent: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

        return {
            message: 'Tạo Conversation thành công',
            conversation,
        };
    }

    async findAll(user?: {
        id: string;
        role: string;
    }) {
        const conversations =
            await this.prisma.conversation.findMany({
                where:
                    user?.role === 'AGENT'
                        ? {
                              agentId: user.id,
                          }
                        : undefined,

                select: {
                    id: true,
                    ticketId: true,
                    customerId: true,
                    agentId: true,
                    status: true,
                    startedAt: true,
                    endedAt: true,

                    ticket: {
                        select: {
                            id: true,
                            subject: true,
                            priority: true,
                            status: true,
                        },
                    },

                    customer: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },

                    agent: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            isOnline: true,
                        },
                    },

                    _count: {
                        select: {
                            messages: true,
                        },
                    },
                },

                orderBy: {
                    startedAt: 'desc',
                },
            });

        return {
            total: conversations.length,
            conversations,
        };
    }

    async findOne(
        id: string,
        user?: {
            id: string;
            role: string;
        },
    ) {
        const conversation =
            await this.prisma.conversation.findUnique({
                where: {
                    id,
                },

                select: {
                    id: true,
                    ticketId: true,
                    customerId: true,
                    agentId: true,
                    status: true,
                    startedAt: true,
                    endedAt: true,

                    ticket: {
                        select: {
                            id: true,
                            subject: true,
                            priority: true,
                            status: true,
                        },
                    },

                    customer: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            avatar: true,
                        },
                    },

                    agent: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            isOnline: true,
                        },
                    },

                    messages: {
                        select: {
                            id: true,
                            senderType: true,
                            senderId: true,
                            content: true,
                            messageType: true,
                            isRead: true,
                            createdAt: true,
                        },

                        orderBy: {
                            createdAt: 'asc',
                        },
                    },
                },
            });

        if (!conversation) {
            throw new NotFoundException(
                'Không tìm thấy Conversation',
            );
        }

        if (
            user &&
            user.role === 'AGENT' &&
            conversation.agentId !== user.id
        ) {
            throw new ForbiddenException(
                'Bạn không được phép truy cập Conversation này',
            );
        }

        return conversation;
    }

    async update(
        id: string,
        updateConversationDto: UpdateConversationDto,
        user?: {
            id: string;
            role: string;
        },
    ) {
        const conversation =
            await this.prisma.conversation.findUnique({
                where: {
                    id,
                },

                include: {
                    ticket: true,
                },
            });

        if (!conversation) {
            throw new NotFoundException(
                'Không tìm thấy Conversation',
            );
        }

        if (
            user &&
            user.role === 'AGENT' &&
            conversation.agentId !== user.id
        ) {
            throw new ForbiddenException(
                'Bạn không được phép cập nhật Conversation này',
            );
        }


        const data: {
            status?: UpdateConversationDto['status'];
            endedAt?: Date | null;
        } = {};


        if (
            updateConversationDto.status !== undefined
        ) {
            data.status =
                updateConversationDto.status;

            if (
                updateConversationDto.status === 'CLOSED'
            ) {
                data.endedAt = new Date();
            } else {
                data.endedAt = null;
            }
        }

        const updatedConversation =
            await this.prisma.conversation.update({
                where: {
                    id,
                },

                data,

                select: {
                    id: true,
                    ticketId: true,
                    customerId: true,
                    agentId: true,
                    status: true,
                    startedAt: true,
                    endedAt: true,

                    agent: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

        return {
            message:
                'Cập nhật Conversation thành công',
            conversation: updatedConversation,
        };
    }

    async close(
        id: string,
        user?: {
            id: string;
            role: string;
        },
    ) {
        const conversation =
            await this.prisma.conversation.findUnique({
                where: {
                    id,
                },
            });

        if (!conversation) {
            throw new NotFoundException(
                'Không tìm thấy Conversation',
            );
        }

        if (
            user &&
            user.role === 'AGENT' &&
            conversation.agentId !== user.id
        ) {
            throw new ForbiddenException(
                'Bạn không được phép đóng Conversation này',
            );
        }

        const updatedConversation =
            await this.prisma.conversation.update({
                where: {
                    id,
                },

                data: {
                    status: 'CLOSED',
                    endedAt: new Date(),
                },

                select: {
                    id: true,
                    status: true,
                    endedAt: true,
                },
            });

        await this.prisma.ticket.update({
            where: {
                id: conversation.ticketId,
            },

            data: {
                status: 'CLOSED',
                closedAt: new Date(),
            },
        });

        return {
            message: 'Đã đóng Conversation',
            conversation: updatedConversation,
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
                'Agent không thuộc Department của Conversation',
            );
        }
    }
}