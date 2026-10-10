import { IsOptional, IsString } from "class-validator";

export class CompleteAdoptionDto {
  @IsOptional()
  @IsString()
  observacoes?: string;
}