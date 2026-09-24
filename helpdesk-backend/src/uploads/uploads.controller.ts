import {
    BadRequestException,
    Controller,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
        Body,
    Param,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { extname } from 'path';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'AGENT')
export class UploadsController {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    @Post('chat')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/chat',

                filename: (
                    req,
                    file,
                    callback,
                ) => {
                    const extension =
                        extname(
                            file.originalname,
                        );

                    const filename =
                        `${Date.now()}-${Math.round(
                            Math.random() *
                            1e9,
                        )}${extension}`;

                    callback(
                        null,
                        filename,
                    );
                },
            }),

            limits: {
                fileSize:
                    10 * 1024 * 1024,
            },

            fileFilter: (
                req,
                file,
                callback,
            ) => {
                const allowedTypes = [
                    'image/jpeg',
                    'image/png',
                    'image/webp',
                    'application/pdf',
                    'text/plain',
                ];

                if (
                    !allowedTypes.includes(
                        file.mimetype,
                    )
                ) {
                    return callback(
                        new BadRequestException(
                            'Định dạng file không được hỗ trợ',
                        ),
                        false,
                    );
                }

                callback(null, true);
            },
        }),
    )

    uploadChatFile(
        @UploadedFile()
        file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException(
                'File là bắt buộc',
            );
        }

        const isImage =
            file.mimetype.startsWith(
                'image/',
            );

        return {
            message:
                'Upload file thành công',

            file: {
                originalName:
                    file.originalname,

                filename:
                    file.filename,

                mimetype:
                    file.mimetype,

                size:
                    file.size,

                type:
                    isImage
                        ? 'IMAGE'
                        : 'FILE',

                url:
                    `/uploads/chat/${file.filename}`,
            },
        };
    }
}