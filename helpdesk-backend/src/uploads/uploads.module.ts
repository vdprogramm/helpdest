import { Module } from '@nestjs/common';

import { UploadsController } from './uploads.controller';
import { CustomerUploadsController } from './customer-uploads.controller';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
  ],

  controllers: [
    UploadsController,
    CustomerUploadsController,
  ],
})
export class UploadsModule { }