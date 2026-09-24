import {
    IsNotEmpty,
    IsOptional,
    IsUUID,
} from 'class-validator';

export class CreateConversationDto {
    @IsUUID()
    @IsNotEmpty()
    ticketId: string;

    @IsUUID()
    @IsNotEmpty()
    customerId: string;

    @IsOptional()
    @IsUUID()
    agentId?: string;
}