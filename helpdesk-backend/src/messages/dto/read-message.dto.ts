import { IsBoolean } from 'class-validator';

export class ReadMessageDto {
    @IsBoolean()
    isRead: boolean;
}