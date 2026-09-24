import { Module } from '@nestjs/common';

import { DepartmentsController } from './departments.controller';
import { PublicDepartmentsController } from './public-departments.controller';
import { DepartmentsService } from './departments.service';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
  ],
  controllers: [
    DepartmentsController,
    PublicDepartmentsController,
  ],
  providers: [
    DepartmentsService,
  ],
  exports: [
    DepartmentsService,
  ],
})
export class DepartmentsModule { }