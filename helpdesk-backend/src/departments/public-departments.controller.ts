import {
    Controller,
    Get,
} from '@nestjs/common';

import { DepartmentsService } from './departments.service';

@Controller('public/departments')
export class PublicDepartmentsController {
    constructor(
        private readonly departmentsService: DepartmentsService,
    ) { }

    @Get()
    async findAll() {
        return this.departmentsService.findAll();
    }
}
