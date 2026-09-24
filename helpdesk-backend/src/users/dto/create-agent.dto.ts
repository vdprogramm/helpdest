import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateAgentDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    name: string;

    @IsEmail()
    @IsNotEmpty()
    @MaxLength(255)
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(100)
    password: string;
}