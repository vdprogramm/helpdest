import {
    BadRequestException,
    Body,
    Controller,
    ForbiddenException,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { PrismaService } from '../prisma/prisma.service';

@Controller('customer-uploads')
export class CustomerUploadsController {
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
                        extname(file.originalname);

                    const filename =
                        `${Date.now()}-${Math.round(
                            Math.random() * 1e9,
                        )}${extension}`;

                    callback(null, filename);
                },
            }),

            limits: {
                fileSize: 10 * 1024 * 1024,
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
    async upload(
        @Body('customerId')
        customerId: string,

        @Body('conversationId')
        conversationId: string,

        @UploadedFile()
        file: Express.Multer.File,
    ) {
        if (
            !customerId ||
            !conversationId
        ) {
            throw new BadRequestException(
                'customerId và conversationId là bắt buộc',
            );
        }

        if (!file) {
            throw new BadRequestException(
                'File là bắt buộc',
            );
        }

        const conversation =
            await this.prisma.conversation.findUnique({
                where: {
                    id: conversationId,
                },

                select: {
                    customerId: true,
                    status: true,
                },
            });

        if (!conversation) {
            throw new BadRequestException(
                'Conversation không tồn tại',
            );
        }

        if (
            conversation.customerId !==
            customerId
        ) {
            throw new ForbiddenException(
                'Customer không thuộc Conversation này',
            );
        }

        if (
            conversation.status === 'CLOSED'
        ) {
            throw new BadRequestException(
                'Conversation đã đóng',
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