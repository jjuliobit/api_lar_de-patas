import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { PetModule } from './pet/pet.module';


@Module({
  imports: [DatabaseModule, UserModule, PetModule],
})
export class AppModule {}
