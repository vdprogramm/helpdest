import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

import { MessageType } from '@prisma/client';

export class CreateAgentMessageDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(5000)
    content: string;

    @IsOptional()
    @IsEnum(MessageType)
    messageType?: MessageType;
}