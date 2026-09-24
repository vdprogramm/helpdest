import { IsEnum } from 'class-validator';

export enum AgentStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export class UpdateAgentStatusDto {
    @IsEnum(AgentStatus)
    status: AgentStatus;
}