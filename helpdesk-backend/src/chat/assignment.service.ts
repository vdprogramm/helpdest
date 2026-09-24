import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssignmentService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    /**
     * Tìm Agent phù hợp để nhận Conversation mới.
     *
     * Điều kiện:
     * - Role = AGENT
     * - Account ACTIVE
     * - Đang ONLINE
     * - Thuộc Department
     *
     * Ưu tiên Agent có ít Conversation ACTIVE nhất.
     */
    async findAvailableAgent(
        departmentId: string,
    ) {
        const agents =
            await this.prisma.user.findMany({
                where: {
                    role: 'AGENT',
                    status: 'ACTIVE',
                    isOnline: true,

                    agentDepartments: {
                        some: {
                            departmentId,
                        },
                    },
                },

                include: {
                    _count: {
                        select: {
                            conversations: {
                                where: {
                                    status: 'ACTIVE',
                                },
                            },
                        },
                    },
                },
            });

        if (agents.length === 0) {
            return null;
        }

        agents.sort(
            (a, b) =>
                a._count.conversations -
                b._count.conversations,
        );

        return agents[0];
    }

    /**
     * Khi một Agent online:
     * tìm Conversation cũ đang chờ trong
     * Department mà Agent phụ trách.
     *
     * Hiện tại mỗi lần chỉ lấy 1 Conversation
     * lâu nhất để đảm bảo FIFO cơ bản.
     */
    async assignWaitingConversation(
        agentId: string,
    ) {
        // 1. Kiểm tra Agent
        const agent =
            await this.prisma.user.findUnique({
                where: {
                    id: agentId,
                },

                include: {
                    agentDepartments: true,
                },
            });

        if (!agent) {
            return null;
        }

        if (
            agent.role !== 'AGENT' ||
            agent.status !== 'ACTIVE' ||
            !agent.isOnline
        ) {
            return null;
        }

        // 2. Lấy các Department Agent phụ trách
        const departmentIds =
            agent.agentDepartments.map(
                (item) => item.departmentId,
            );

        if (departmentIds.length === 0) {
            return null;
        }

        // 3. Tìm Conversation đang chờ lâu nhất
        const waitingConversation =
            await this.prisma.conversation.findFirst({
                where: {
                    status: 'ACTIVE',
                    agentId: null,

                    ticket: {
                        status: 'OPEN',

                        departmentId: {
                            in: departmentIds,
                        },
                    },
                },

                include: {
                    customer: true,
                    ticket: true,
                },
            });

        if (!waitingConversation) {
            return null;
        }

        // 4. Gán Conversation + Ticket
        // trong cùng một transaction
        const result =
            await this.prisma.$transaction(
                async (tx) => {
                    const conversation =
                        await tx.conversation.update({
                            where: {
                                id: waitingConversation.id,
                            },

                            data: {
                                agentId: agent.id,
                            },

                            include: {
                                customer: true,
                                agent: true,
                                ticket: true,
                            },
                        });

                    const ticket =
                        await tx.ticket.update({
                            where: {
                                id: waitingConversation.ticketId,
                            },

                            data: {
                                assignedAgentId: agent.id,
                                status: 'IN_PROGRESS',
                            },
                        });

                    return {
                        conversation,
                        ticket,
                        agent,
                    };
                },
            );

        return result;
    }
}