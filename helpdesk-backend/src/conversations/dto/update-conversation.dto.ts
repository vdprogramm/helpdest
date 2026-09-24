import {
  IsEnum,
  IsOptional,
} from 'class-validator';

import { ConversationStatus } from '@prisma/client';

export class UpdateConversationDto {
  @IsOptional()
  @IsEnum(ConversationStatus)
  status?: ConversationStatus;
}