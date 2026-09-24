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

import { CustomersService } from './customers.service';

import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'AGENT')
export class CustomersController {
    constructor(
        private readonly customersService: CustomersService,
    ) { }

    @Post()
    async create(
        @Body() createCustomerDto: CreateCustomerDto,
    ) {
        return this.customersService.create(
            createCustomerDto,
        );
    }

    @Get()
    async findAll() {
        return this.customersService.findAll();
    }

    @Get(':id')
    async findOne(
        @Param('id', new ParseUUIDPipe())
        id: string,
    ) {
        return this.customersService.findOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Body() updateCustomerDto: UpdateCustomerDto,
    ) {
        return this.customersService.update(
            id,
            updateCustomerDto,
        );
    }
}