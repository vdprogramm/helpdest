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

import { ConversationsService } from './conversations.service';

import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('conversations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'AGENT')
export class ConversationsController {
    constructor(
        private readonly conversationsService: ConversationsService,
    ) { }

    @Post()
    async create(
        @Body()
        createConversationDto: CreateConversationDto,
    ) {
        return this.conversationsService.create(
            createConversationDto,
        );
    }

    @Get()
    async findAll(
        @Req() req: any,
    ) {
        return this.conversationsService.findAll(
            req.user,
        );
    }

    @Get(':id')
    async findOne(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: any,
    ) {
        return this.conversationsService.findOne(
            id,
            req.user,
        );
    }

    @Patch(':id')
    async update(
        @Param('id', new ParseUUIDPipe())
        id: string,

        @Body()
        updateConversationDto: UpdateConversationDto,

        @Req()
        req: any,
    ) {
        return this.conversationsService.update(
            id,
            updateConversationDto,
            req.user,
        );
    }

    @Post(':id/close')
    async close(
        @Param('id', new ParseUUIDPipe())
        id: string,

        @Req()
        req: any,
    ) {
        return this.conversationsService.close(
            id,
            req.user,
        );
    }
}