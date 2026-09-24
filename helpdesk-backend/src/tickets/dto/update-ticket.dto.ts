import {
    IsEnum,
    IsOptional,
} from 'class-validator';

import {
    TicketPriority,
    TicketStatus,
} from '@prisma/client';

export class UpdateTicketDto {
    @IsOptional()
    @IsEnum(TicketPriority)
    priority?: TicketPriority;

    @IsOptional()
    @IsEnum(TicketStatus)
    status?: TicketStatus;
}