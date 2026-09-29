import { Module } from '@nestjs/common';
import { PetService } from './pet.service';
import { PetController } from './pet.controller';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [PetController],
  providers: [PetService, AuthService] 
})
export class PetModule {}
