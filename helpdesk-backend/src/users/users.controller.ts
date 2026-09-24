import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';

import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { UpdateAgentStatusDto } from './dto/update-agent-status.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('agents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @Post()
    async createAgent(
        @Body() createAgentDto: CreateAgentDto,
    ) {
        return this.usersService.createAgent(
            createAgentDto,
        );
    }

    @Get()
    async findAllAgents() {
        return this.usersService.findAllAgents();
    }

    @Get(':id')
    async findAgentById(
        @Param('id', new ParseUUIDPipe())
        id: string,
    ) {
        return this.usersService.findAgentById(id);
    }

    @Patch(':id')
    async updateAgent(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Body() updateAgentDto: UpdateAgentDto,
    ) {
        return this.usersService.updateAgent(
            id,
            updateAgentDto,
        );
    }

    @Patch(':id/status')
    async updateAgentStatus(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Body()
        updateAgentStatusDto: UpdateAgentStatusDto,
    ) {
        return this.usersService.updateAgentStatus(
            id,
            updateAgentStatusDto,
        );
    }

    @Delete(':id')
    async deleteAgent(
        @Param('id', new ParseUUIDPipe())
        id: string,
    ) {
        return this.usersService.deleteAgent(id);
    }
}