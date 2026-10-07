import { Module } from '@nestjs/common';
import { LostPetsService } from './lost-pets.service';
import { LostPetsController } from './lost-pets.controller';

@Module({
  controllers: [LostPetsController],
  providers: [LostPetsService],
})
export class LostPetsModule {}
