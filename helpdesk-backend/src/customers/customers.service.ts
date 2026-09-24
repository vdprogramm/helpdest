import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async create(
        createCustomerDto: CreateCustomerDto,
    ) {
        const customer =
            await this.prisma.customer.create({
                data: {
                    name: createCustomerDto.name,
                    email: createCustomerDto.email,
                    phone: createCustomerDto.phone,
                    avatar: createCustomerDto.avatar,
                },

                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    avatar: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

        return {
            message: 'Tạo Customer thành công',
            customer,
        };
    }

    async findAll() {
        const customers =
            await this.prisma.customer.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    avatar: true,
                    createdAt: true,
                    updatedAt: true,

                    _count: {
                        select: {
                            tickets: true,
                            conversations: true,
                        },
                    },
                },

                orderBy: {
                    createdAt: 'desc',
                },
            });

        return {
            total: customers.length,
            customers,
        };
    }

    async findOne(id: string) {
        const customer =
            await this.prisma.customer.findUnique({
                where: {
                    id,
                },

                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    avatar: true,
                    createdAt: true,
                    updatedAt: true,

                    tickets: {
                        select: {
                            id: true,
                            subject: true,
                            priority: true,
                            status: true,
                            createdAt: true,
                            updatedAt: true,

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

                        orderBy: {
                            createdAt: 'desc',
                        },
                    },
                },
            });

        if (!customer) {
            throw new NotFoundException(
                'Không tìm thấy Customer',
            );
        }

        return customer;
    }

    async update(
        id: string,
        updateCustomerDto: UpdateCustomerDto,
    ) {
        const customer =
            await this.prisma.customer.findUnique({
                where: {
                    id,
                },
            });

        if (!customer) {
            throw new NotFoundException(
                'Không tìm thấy Customer',
            );
        }

        const updatedCustomer =
            await this.prisma.customer.update({
                where: {
                    id,
                },

                data: {
                    name: updateCustomerDto.name,
                    email: updateCustomerDto.email,
                    phone: updateCustomerDto.phone,
                    avatar: updateCustomerDto.avatar,
                },

                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    avatar: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

        return {
            message: 'Cập nhật Customer thành công',
            customer: updatedCustomer,
        };
    }
}