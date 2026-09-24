import { IsBoolean } from 'class-validator';

export class UpdateDepartmentStatusDto {
    @IsBoolean()
    status: boolean;
}