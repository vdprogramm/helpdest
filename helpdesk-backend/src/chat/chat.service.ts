import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { AssignmentService } from './assignment.service';
import { Customer } from '@prisma/client';

@Injectable()
export class ChatService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly assignmentService: AssignmentService,
    ) { }


    async connectCustomer(data: {
        name: string;
        email?: string;
        phone?: string;
    }) {
        if (!data.name?.trim()) {
            throw new BadRequestException(
                'Tên khách hàng là bắt buộc',
            );
        }

        if (!data.email && !data.phone) {
            throw new BadRequestException(
                'Cần cung cấp email hoặc số điện thoại',
            );
        }

        let customer: Customer | null = null;

        if (data.email) {
            customer = await this.prisma.customer.findFirst({
                where: {
                    email: data.email,
                },
            });
        }

        if (!customer && data.phone) {
            customer = await this.prisma.customer.findFirst({
                where: {
                    phone: data.phone,
                },
            });
        }

        if (!customer) {
            customer = await this.prisma.customer.create({
                data: {
                    name: data.name.trim(),
                    email: data.email || null,
                    phone: data.phone || null,
                },
            });
        } else {
            customer = await this.prisma.customer.update({
                where: {
                    id: customer.id,
                },
                data: {
                    name: data.name.trim(),
                    email: data.email || customer.email,
                    phone: data.phone || customer.phone,
                },
            });
        }

        return customer;
    }

    async startChat(data: {
        customerId: string;
        departmentId: string;
        subject: string;
        message?: string;
    }) {
        const customer =
            await this.prisma.customer.findUnique({
                where: {
                    id: data.customerId,
                },
            });

        if (!customer) {
            throw new NotFoundException(
                'Customer không tồn tại',
            );
        }

        const department =
            await this.prisma.department.findUnique({
                where: {
                    id: data.departmentId,
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


        const existingConversation =
            await this.prisma.conversation.findFirst({
                where: {
                    customerId: data.customerId,
                    status: 'ACTIVE',
                },
                include: {
                    ticket: true,
                    agent: true,
                },
            });

        if (existingConversation) {
            return {
                isExisting: true,
                ticket: existingConversation.ticket,
                conversation: existingConversation,
                agent: existingConversation.agent,
            };
        }


        const agent =
            await this.assignmentService.findAvailableAgent(
                data.departmentId,
            );


        const ticket = await this.prisma.ticket.create({
            data: {
                customerId: customer.id,
                departmentId: department.id,
                assignedAgentId: agent?.id || null,
                subject: data.subject,
                status: agent
                    ? 'IN_PROGRESS'
                    : 'OPEN',
            },
        });


        const conversation =
            await this.prisma.conversation.create({
                data: {
                    ticketId: ticket.id,
                    customerId: customer.id,
                    agentId: agent?.id || null,
                    status: 'ACTIVE',
                },
                include: {
                    customer: true,
                    agent: true,
                    ticket: true,
                },
            });


        if (data.message?.trim()) {
            await this.prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    senderType: 'CUSTOMER',
                    senderId: customer.id,
                    content: data.message.trim(),
                    messageType: 'TEXT',
                },
            });
        }

        return {
            isExisting: false,
            ticket,
            conversation,
            agent,
        };
    }
}