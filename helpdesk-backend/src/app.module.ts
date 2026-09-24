import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { DepartmentsModule } from './departments/departments.module';
import { TicketsModule } from './tickets/tickets.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { CannedResponsesModule } from './canned-responses/canned-responses.module';
import { ChatModule } from './chat/chat.module';
import { PrismaModule } from './prisma/prisma.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { UploadsModule } from './uploads/uploads.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [AuthModule, UsersModule, CustomersModule, DepartmentsModule, TicketsModule, ConversationsModule, MessagesModule, CannedResponsesModule, ChatModule, PrismaModule, DashboardModule, UploadsModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
