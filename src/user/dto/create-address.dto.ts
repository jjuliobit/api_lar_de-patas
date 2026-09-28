import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsOptional()
  cep?: string;

  @IsString()
  @IsNotEmpty({ message: 'O logradouro é obrigatório.' })
  logradouro: string;

  @IsString()
  @IsNotEmpty({ message: 'O número é obrigatório.' })
  numero: string;

  @IsString()
  @IsOptional()
  complemento?: string;

  @IsString()
  @IsOptional()
  bairro?: string;

  @IsString()
  @IsNotEmpty({ message: 'A cidade é obrigatória.' })
  cidade: string;

  @IsString()
  @IsNotEmpty({ message: 'O estado é obrigatório.' })
  estado: string;
}
