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

import { DepartmentsService } from './departments.service';

import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { UpdateDepartmentStatusDto } from './dto/update-department-status.dto';
import { AssignAgentDto } from './dto/assign-agent.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class DepartmentsController {
    constructor(
        private readonly departmentsService: DepartmentsService,
    ) { }

    @Post()
    async create(
        @Body()
        createDepartmentDto: CreateDepartmentDto,
    ) {
        return this.departmentsService.create(
            createDepartmentDto,
        );
    }

    @Get()
    async findAll() {
        return this.departmentsService.findAll();
    }

    @Get(':id')
    async findOne(
        @Param('id', new ParseUUIDPipe())
        id: string,
    ) {
        return this.departmentsService.findOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Body()
        updateDepartmentDto: UpdateDepartmentDto,
    ) {
        return this.departmentsService.update(
            id,
            updateDepartmentDto,
        );
    }

    @Patch(':id/status')
    async updateStatus(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Body()
        updateDepartmentStatusDto: UpdateDepartmentStatusDto,
    ) {
        return this.departmentsService.updateStatus(
            id,
            updateDepartmentStatusDto,
        );
    }

    @Post(':id/agents')
    async assignAgent(
        @Param('id', new ParseUUIDPipe())
        departmentId: string,
        @Body() assignAgentDto: AssignAgentDto,
    ) {
        return this.departmentsService.assignAgent(
            departmentId,
            assignAgentDto.agentId,
        );
    }

    @Delete(':id/agents/:agentId')
    async removeAgent(
        @Param('id', new ParseUUIDPipe())
        departmentId: string,
        @Param('agentId', new ParseUUIDPipe())
        agentId: string,
    ) {
        return this.departmentsService.removeAgent(
            departmentId,
            agentId,
        );
    }

    @Delete(':id')
    async remove(
        @Param('id', new ParseUUIDPipe())
        id: string,
    ) {
        return this.departmentsService.remove(id);
    }
}