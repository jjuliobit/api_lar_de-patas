import { Especie, Prisma, SexoPet, StatusPet } from '@prisma/client';
import { Type } from 'class-transformer';
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

  @Type(() => Number)
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
  descricao?: string | null;

  @IsString()
  @IsOptional()
  localizacao?: string | null;

  @IsString()
  @IsOptional()
  @IsEnum(StatusPet)
  status?: StatusPet;

  @IsString()
  @IsNotEmpty({ message: 'O ID do usuário (userId) é obrigatório.' })
  userId: string;
}