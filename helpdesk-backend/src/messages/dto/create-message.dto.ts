import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';

import {
    MessageType,
    SenderType,
} from '@prisma/client';

export class CreateMessageDto {
    @IsEnum(SenderType)
    senderType: SenderType;

    @IsOptional()
    @IsString()
    senderId?: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsOptional()
    @IsEnum(MessageType)
    messageType?: MessageType;
}