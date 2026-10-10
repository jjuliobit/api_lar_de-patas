import { Module } from '@nestjs/common';
import { AdoptionService } from './adoption.service';
import { AdoptionController } from './adoption.controller';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [AdoptionController],
  providers: [AdoptionService, AuthService],
})
export class AdoptionModule {}
