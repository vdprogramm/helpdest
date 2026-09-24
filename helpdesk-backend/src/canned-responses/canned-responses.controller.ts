import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';

import { CannedResponsesService } from './canned-responses.service';

import { CreateCannedResponseDto } from './dto/create-canned-response.dto';
import { UpdateCannedResponseDto } from './dto/update-canned-response.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('canned-responses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'AGENT')
export class CannedResponsesController {
    constructor(
        private readonly cannedResponsesService: CannedResponsesService,
    ) { }

    @Post()
    async create(
        @Req() req: any,
        @Body() dto: CreateCannedResponseDto,
    ) {
        return this.cannedResponsesService.create(
            req.user.id,
            dto,
        );
    }

    @Get()
    async findAll(
        @Query('departmentId')
        departmentId?: string,
    ) {
        return this.cannedResponsesService.findAll(
            departmentId,
        );
    }

    @Get('department/:departmentId')
    async findByDepartment(
        @Param(
            'departmentId',
            new ParseUUIDPipe(),
        )
        departmentId: string,
    ) {
        return this.cannedResponsesService.findByDepartment(
            departmentId,
        );
    }

    @Get(':id')
    async findOne(
        @Param('id', new ParseUUIDPipe())
        id: string,
    ) {
        return this.cannedResponsesService.findOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Body() dto: UpdateCannedResponseDto,
    ) {
        return this.cannedResponsesService.update(
            id,
            dto,
        );
    }

    @Delete(':id')
    @Roles('ADMIN')
    async remove(
        @Param('id', new ParseUUIDPipe())
        id: string,
    ) {
        return this.cannedResponsesService.remove(id);
    }
}