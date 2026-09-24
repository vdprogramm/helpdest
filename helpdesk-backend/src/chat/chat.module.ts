import { Module } from '@nestjs/common';

import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { AssignmentService } from './assignment.service';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { MessagesModule } from '../messages/messages.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { ConversationsService } from 'src/conversations/conversations.service';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MessagesModule,
    ConversationsModule,
  ],
  providers: [
    ChatGateway,
    ChatService,
    AssignmentService,
    ConversationsService,
  ],
  exports: [
    ChatService,
    AssignmentService,
    ConversationsService,
  ],
})
export class ChatModule { }