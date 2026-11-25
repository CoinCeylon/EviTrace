import { InspectionsController } from './inspections.controller';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { TransfersController } from './transfers.controller';

@Module({
  controllers: [AppController, TransfersController, InspectionsController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
