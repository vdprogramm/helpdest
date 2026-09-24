import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async create(
        conversationId: string,
        createMessageDto: CreateMessageDto,
    ) {
        const conversation =
            await this.prisma.conversation.findUnique({
                where: {
                    id: conversationId,
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

        if (conversation.status === 'CLOSED') {
            throw new ConflictException(
                'Conversation đã đóng',
            );
        }

        let ticketStatusChanged = false;

        if (
            createMessageDto.senderType === 'AGENT'
        ) {
            if (!createMessageDto.senderId) {
                throw new ConflictException(
                    'Agent message phải có senderId',
                );
            }

            const agent =
                await this.prisma.user.findFirst({
                    where: {
                        id: createMessageDto.senderId,
                        role: 'AGENT',
                        status: 'ACTIVE',
                    },
                });

            if (!agent) {
                throw new NotFoundException(
                    'Agent không tồn tại hoặc đang bị khóa',
                );
            }

            if (
                conversation.agentId !==
                createMessageDto.senderId
            ) {
                throw new ConflictException(
                    'Agent không được gán cho Conversation này',
                );
            }
        }

        if (
            createMessageDto.senderType ===
            'CUSTOMER'
        ) {
            if (!createMessageDto.senderId) {
                throw new ConflictException(
                    'Customer message phải có senderId',
                );
            }

            if (
                conversation.customerId !==
                createMessageDto.senderId
            ) {
                throw new ConflictException(
                    'Customer không thuộc Conversation này',
                );
            }
            if (
                conversation.ticket.status ===
                'WAITING'
            ) {
                await this.prisma.ticket.update({
                    where: {
                        id: conversation.ticketId,
                    },

                    data: {
                        status: 'IN_PROGRESS',
                        closedAt: null,
                    },
                });
                ticketStatusChanged = true;
            }
        }

        const message =
            await this.prisma.message.create({
                data: {
                    conversationId,
                    senderType:
                        createMessageDto.senderType,
                    senderId:
                        createMessageDto.senderId,
                    content:
                        createMessageDto.content,
                    messageType:
                        createMessageDto.messageType ??
                        'TEXT',
                },

                select: {
                    id: true,
                    conversationId: true,
                    senderType: true,
                    senderId: true,
                    content: true,
                    messageType: true,
                    isRead: true,
                    createdAt: true,
                },
            });

        return {
            message: 'Gửi Message thành công',
            data: message,

            ticketStatusChanged,

            ticketStatus:
                ticketStatusChanged
                    ? 'IN_PROGRESS'
                    : conversation.ticket.status,
        };
    }

    async findByConversation(
        conversationId: string,
        user?: {
            id: string;
            role: string;
        },
    ) {
        const conversation =
            await this.prisma.conversation.findUnique({
                where: {
                    id: conversationId,
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
                'Bạn không được phép xem Message của Conversation này',
            );
        }

        const messages =
            await this.prisma.message.findMany({
                where: {
                    conversationId,
                },

                select: {
                    id: true,
                    conversationId: true,
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
            });

        return {
            total: messages.length,
            messages,
        };
    }

    async markAsRead(
        conversationId: string,
        user?: {
            id: string;
            role: string;
        },
    ) {
        const conversation =
            await this.prisma.conversation.findUnique({
                where: {
                    id: conversationId,
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
                'Bạn không được phép cập nhật Message của Conversation này',
            );
        }

        const result =
            await this.prisma.message.updateMany({
                where: {
                    conversationId,
                    isRead: false,
                },

                data: {
                    isRead: true,
                },
            });

        return {
            message: 'Đã đánh dấu Message đã đọc',
            updatedCount: result.count,
        };
    }
}