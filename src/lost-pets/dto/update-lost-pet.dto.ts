import { PartialType } from '@nestjs/swagger';
import { CreateLostPetDto } from './create-lost-pet.dto';

export class UpdateLostPetDto extends PartialType(CreateLostPetDto) {}
