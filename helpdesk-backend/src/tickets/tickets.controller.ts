import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';

import { TicketsService } from './tickets.service';

import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'AGENT')
export class TicketsController {
    constructor(
        private readonly ticketsService: TicketsService,
    ) { }

    @Post()
    async create(
        @Body() createTicketDto: CreateTicketDto,
    ) {
        return this.ticketsService.create(
            createTicketDto,
        );
    }

    @Get()
    async findAll() {
        return this.ticketsService.findAll();
    }

    @Get(':id')
    async findOne(
        @Param('id', new ParseUUIDPipe())
        id: string,
    ) {
        return this.ticketsService.findOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Body() updateTicketDto: UpdateTicketDto,
    ) {
        return this.ticketsService.update(
            id,
            updateTicketDto,
        );
    }

    @Patch(':id/assign/:agentId')
    @Roles('ADMIN')
    async assignAgent(
        @Param('id', new ParseUUIDPipe())
        ticketId: string,
        @Param('agentId', new ParseUUIDPipe())
        agentId: string,
    ) {
        return this.ticketsService.assignAgent(
            ticketId,
            agentId,
        );
    }
}