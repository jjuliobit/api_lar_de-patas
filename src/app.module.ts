import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { PetModule } from './pet/pet.module';
import { AuthModule } from './auth/auth.module';
import { LostPetsModule } from './lost-pets/lost-pets.module';


@Module({
  imports: [DatabaseModule, UserModule, PetModule, AuthModule, LostPetsModule],
})
export class AppModule {}
