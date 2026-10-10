import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAdoptionDto {
  @IsNotEmpty({ message: 'O ID do pet é obrigatório' })
  @IsUUID('4', { message: 'O ID do pet deve ser um UUID válido' })
  petId: string;

  @IsOptional()
  @IsString({ message: 'As observações devem ser texto' })
  observacoes?: string;
}
