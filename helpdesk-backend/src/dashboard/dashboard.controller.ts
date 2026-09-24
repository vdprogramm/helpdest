import {
    Controller,
    Get,
    UseGuards,
} from '@nestjs/common';

import { DashboardService } from './dashboard.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
    ) { }

    @Get('overview')
    async getOverview() {
        return this.dashboardService.getOverview();
    }

    @Get('tickets-by-department')
    async getTicketsByDepartment() {
        return this.dashboardService
            .getTicketsByDepartment();
    }

    @Get('tickets-by-priority')
    async getTicketsByPriority() {
        return this.dashboardService
            .getTicketsByPriority();
    }

    @Get('recent-tickets')
    async getRecentTickets() {
        return this.dashboardService
            .getRecentTickets();
    }

    @Get('agent-performance')
    async getAgentPerformance() {
        return this.dashboardService
            .getAgentPerformance();
    }

    @Get('tickets-by-day')
    async getTicketsByDay() {
        return this.dashboardService
            .getTicketsByDay();
    }
}