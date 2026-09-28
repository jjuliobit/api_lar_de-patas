import { Especie, Prisma, SexoPet } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreatePetDto implements Prisma.PetUncheckedCreateInput {
  @IsString()
  @IsNotEmpty({ message: 'O nome do pet é obrigatório.' })
  nome: string;

  @IsInt({ message: 'A idade deve ser um número inteiro.' })
  @Min(0, { message: 'A idade deve ser maior ou igual a 0.' })
  @IsNotEmpty({ message: 'A idade é obrigatória.' })
  idade: number;

  @IsEnum(SexoPet, {
    message: 'O sexo do pet deve ser Macho ou Femea.',
  })
  @IsNotEmpty({ message: 'O sexo do pet é obrigatório.' })
  sexo: SexoPet;

  @IsEnum(Especie, {
    message: 'A espécie deve ser Cachorro, Gato, Passaro ou Outro.',
  })
  @IsNotEmpty({ message: 'A espécie é obrigatória.' })
  especie: Especie;

  @IsString()
  @IsOptional()
  raca?: string | null;

  @IsString()
  @IsOptional()
  cor?: string | null;

  @IsString()
  @IsOptional()
  foto?: string | null;

  @IsString()
  @IsNotEmpty({ message: 'O ID do usuário (userId) é obrigatório.' })
  userId: string;
}