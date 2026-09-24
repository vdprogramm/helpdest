import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
} from 'class-validator';

import { TicketPriority } from '@prisma/client';

export class CreateTicketDto {
    @IsUUID()
    @IsNotEmpty()
    customerId: string;

    @IsUUID()
    @IsNotEmpty()
    departmentId: string;

    @IsOptional()
    @IsUUID()
    assignedAgentId?: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    subject: string;

    @IsOptional()
    @IsEnum(TicketPriority)
    priority?: TicketPriority;
}