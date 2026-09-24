import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async getTicketsByDepartment() {
        const departments =
            await this.prisma.department.findMany({
                select: {
                    id: true,
                    name: true,

                    _count: {
                        select: {
                            tickets: true,
                        },
                    },
                },

                orderBy: {
                    name: 'asc',
                },
            });

        return departments.map(
            (department) => ({
                departmentId: department.id,
                departmentName: department.name,
                totalTickets:
                    department._count.tickets,
            }),
        );
    }

    async getTicketsByPriority() {
        const result =
            await this.prisma.ticket.groupBy({
                by: ['priority'],

                _count: {
                    _all: true,
                },
            });

        const priorities = [
            'LOW',
            'MEDIUM',
            'HIGH',
            'URGENT',
        ];

        return priorities.map((priority) => {
            const item = result.find(
                (resultItem) =>
                    resultItem.priority === priority,
            );

            return {
                priority,
                total:
                    item?._count._all ?? 0,
            };
        });
    }

    async getRecentTickets() {
        return this.prisma.ticket.findMany({
            take: 10,

            orderBy: {
                createdAt: 'desc',
            },

            select: {
                id: true,
                subject: true,
                status: true,
                priority: true,
                createdAt: true,

                customer: {
                    select: {
                        id: true,
                        name: true,
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
                    },
                },
            },
        });
    }

    async getAgentPerformance() {
        const agents =
            await this.prisma.user.findMany({
                where: {
                    role: 'AGENT',
                    status: 'ACTIVE',
                },

                select: {
                    id: true,
                    name: true,
                    email: true,
                    isOnline: true,

                    assignedTickets: {
                        select: {
                            status: true,
                        },
                    },

                    _count: {
                        select: {
                            conversations: true,
                        },
                    },
                },
            });

        return agents.map((agent) => {
            const totalTickets =
                agent.assignedTickets.length;

            const resolvedTickets =
                agent.assignedTickets.filter(
                    (ticket) =>
                        ticket.status ===
                        'RESOLVED' ||
                        ticket.status ===
                        'CLOSED',
                ).length;

            const activeTickets =
                agent.assignedTickets.filter(
                    (ticket) =>
                        ticket.status ===
                        'IN_PROGRESS' ||
                        ticket.status ===
                        'WAITING',
                ).length;

            return {
                agentId: agent.id,
                name: agent.name,
                email: agent.email,
                isOnline: agent.isOnline,

                totalTickets,
                activeTickets,
                resolvedTickets,

                totalConversations:
                    agent._count.conversations,
            };
        });
    }

    async getOverview() {
        const [
            totalTickets,
            openTickets,
            inProgressTickets,
            waitingTickets,
            resolvedTickets,
            closedTickets,
            totalCustomers,
            totalAgents,
            onlineAgents,
            activeConversations,
        ] = await Promise.all([
            this.prisma.ticket.count(),

            this.prisma.ticket.count({
                where: {
                    status: 'OPEN',
                },
            }),

            this.prisma.ticket.count({
                where: {
                    status: 'IN_PROGRESS',
                },
            }),

            this.prisma.ticket.count({
                where: {
                    status: 'WAITING',
                },
            }),

            this.prisma.ticket.count({
                where: {
                    status: 'RESOLVED',
                },
            }),

            this.prisma.ticket.count({
                where: {
                    status: 'CLOSED',
                },
            }),

            this.prisma.customer.count(),

            this.prisma.user.count({
                where: {
                    role: 'AGENT',
                    status: 'ACTIVE',
                },
            }),

            this.prisma.user.count({
                where: {
                    role: 'AGENT',
                    status: 'ACTIVE',
                    isOnline: true,
                },
            }),

            this.prisma.conversation.count({
                where: {
                    status: 'ACTIVE',
                },
            }),
        ]);

        return {
            tickets: {
                total: totalTickets,
                open: openTickets,
                inProgress: inProgressTickets,
                waiting: waitingTickets,
                resolved: resolvedTickets,
                closed: closedTickets,
            },

            customers: {
                total: totalCustomers,
            },

            agents: {
                total: totalAgents,
                online: onlineAgents,
                offline:
                    totalAgents - onlineAgents,
            },

            conversations: {
                active: activeConversations,
            },
        };
    }

    private buildTicketTrend(
        tickets: {
            createdAt: Date;
        }[],
        days = 7,
    ) {
        const result: {
            date: string;
            count: number;
        }[] = [];

        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);

            date.setDate(
                today.getDate() - i,
            );

            const dateStr =
                date
                    .toISOString()
                    .split('T')[0];

            result.push({
                date: dateStr,
                count: 0,
            });
        }

        for (const ticket of tickets) {
            const dateStr =
                ticket.createdAt
                    .toISOString()
                    .split('T')[0];

            const item =
                result.find(
                    (r) =>
                        r.date === dateStr,
                );

            if (item) {
                item.count++;
            }
        }

        return result;
    }

    async getTicketsByDay(days: number = 7) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (days - 1));
        startDate.setHours(0, 0, 0, 0);

        const tickets = await this.prisma.ticket.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                createdAt: true,
            },
        });

        return this.buildTicketTrend(tickets, days);
    }
}