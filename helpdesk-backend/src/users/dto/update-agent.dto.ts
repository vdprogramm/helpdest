import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UpdateAgentDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    name?: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    email?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(100)
    password?: string;
}