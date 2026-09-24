import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // 1. Tìm user theo email
        const user = await this.prisma.user.findUnique({
            where: {
                email,
            },
        });

        // 2. Không tìm thấy user
        if (!user) {
            throw new UnauthorizedException(
                'Email hoặc mật khẩu không chính xác',
            );
        }

        // 3. Kiểm tra trạng thái tài khoản
        if (user.status === 'INACTIVE') {
            throw new UnauthorizedException(
                'Tài khoản đã bị khóa',
            );
        }

        // 4. So sánh password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException(
                'Email hoặc mật khẩu không chính xác',
            );
        }

        // 5. Tạo payload cho JWT
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        // 6. Tạo JWT
        const accessToken = await this.jwtService.signAsync(payload);

        // 7. Không trả password về frontend
        return {
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
            },
        };
    }

    async register(registerDto: RegisterDto) {
        const { name, email, password } = registerDto;

        // 1. Kiểm tra email đã tồn tại
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            throw new UnauthorizedException(
                'Email đã được sử dụng',
            );
        }

        // 2. Mã hóa password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Tạo user
        const user = await this.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'AGENT',
                status: 'ACTIVE',
            },
        });

        // 4. Trả thông tin user
        return {
            message: 'Đăng ký tài khoản thành công',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
            },
        };
    }
}