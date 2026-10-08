import { Especie, SexoPetPerdido } from '@prisma/client';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateLostPetDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsEnum(Especie, {
    message: 'A espécie deve ser Cachorro, Gato, Passaro ou Outro.',
  })
  @IsNotEmpty()
  especie: Especie;

  @IsEnum(SexoPetPerdido, {
    message: 'O sexo deve ser Macho ou Femea.',
  })
  @IsOptional()
  sexo?: SexoPetPerdido | null;

  @IsString()
  @IsOptional()
  raca?: string | null;

  @IsString()
  @IsOptional()
  cor?: string | null;

  @IsString()
  @IsNotEmpty()
  localizacao: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  dataUltimaVez: Date;

  @IsString()
  @IsOptional()
  descricao?: string | null;

  @Transform(({ value }) => {
    if (value === '' || value === undefined || value === null) return undefined;
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  encontrado?: boolean;

  @IsString()
  @IsNotEmpty()
  nomeContato: string;

  @IsString()
  @IsNotEmpty()
  telefoneContato: string;

  @IsString()
  @IsNotEmpty()
  emailContato: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
