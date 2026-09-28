import { Sexo } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, IsUrl, Min, MinLength, ValidateNested } from 'class-validator';
import { CreateAddressDto } from './create-address.dto';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  nome: string;

  @IsString()
  @IsNotEmpty({ message: 'O sobrenome é obrigatório.' })
  sobrenome: string;

  @IsString()
  @IsOptional()
  telefone?: string | null;

  @IsInt({ message: 'A idade deve ser um número inteiro.' })
  @Min(0, { message: 'A idade deve ser maior ou igual a 0.' })
  @IsNotEmpty({ message: 'A idade é obrigatória.' })
  idade: number;

  @IsEmail({}, { message: 'Insira um e-mail válido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email: string;

  @IsEnum(Sexo, { message: 'O sexo deve ser um valor válido do enum Sexo.' })
  @IsNotEmpty({ message: 'O sexo é obrigatório.' })
  sexo: Sexo;

  @IsString()
  @IsNotEmpty({ message: 'O CPF é obrigatório.' })
  cpf: string;

  @IsString()
  @IsUrl({}, { message: 'A foto deve ser uma URL válida.' })
  @IsOptional()
  foto?: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  password: string;

  @IsObject({ message: 'O endereço deve ser um objeto válido.' })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  @IsNotEmpty({ message: 'O endereço é obrigatório.' })
  address: CreateAddressDto;
}