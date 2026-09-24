import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';

import { MessagesService } from './messages.service';
import { CreateAgentMessageDto } from './dto/create-agent-message.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('conversations/:conversationId/messages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'AGENT')
export class MessagesController {
    constructor(
        private readonly messagesService: MessagesService,
    ) { }

    @Post()
    async create(
        @Param(
            'conversationId',
            new ParseUUIDPipe(),
        )
        conversationId: string,

        @Body()
        createAgentMessageDto: CreateAgentMessageDto,

        @Req()
        req: any,
    ) {
        return this.messagesService.create(
            conversationId,
            {
                senderType: 'AGENT',
                senderId: req.user.id,
                content: createAgentMessageDto.content,
                messageType:
                    createAgentMessageDto.messageType,
            },
        );
    }

    @Get()
    async findByConversation(
        @Param(
            'conversationId',
            new ParseUUIDPipe(),
        )
        conversationId: string,

        @Req()
        req: any,
    ) {
        return this.messagesService.findByConversation(
            conversationId,
            req.user,
        );
    }

    @Patch('read')
    async markAsRead(
        @Param(
            'conversationId',
            new ParseUUIDPipe(),
        )
        conversationId: string,

        @Req()
        req: any,
    ) {
        return this.messagesService.markAsRead(
            conversationId,
            req.user,
        );
    }
}