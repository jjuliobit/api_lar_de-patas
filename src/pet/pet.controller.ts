import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { PetService } from './pet.service';
import { UpdatePetDto } from './dto/update-pet.dto';
import { CreatePetDto } from './dto/create-pet.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { PaginationQueryDto } from './dto/pagination-querry.dto';
import { petPhotoMulterOptions } from 'src/upload/upload.config';

@Controller('pet')
export class PetController {
  constructor(private readonly petService: PetService) {}

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('foto', petPhotoMulterOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nome: { type: 'string' },
        idade: { type: 'number' },
        sexo: { type: 'string', enum: ['Macho', 'Femea'] },
        especie: { type: 'string', enum: ['Cachorro', 'Gato', 'Passaro', 'Outro'] },
        raca: { type: 'string' },
        cor: { type: 'string' },
        descricao: { type: 'string' },
        localizacao: { type: 'string' },
        userId: { type: 'string' },
        foto: { type: 'string', format: 'binary' },
      },
      required: ['nome', 'idade', 'sexo', 'especie', 'userId'],
    },
  })
  create(
    @Body() createPetDto: CreatePetDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.petService.create(createPetDto, file);
  }

  @Get()
  findAll(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.petService.findAll(paginationQueryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.petService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePetDto: UpdatePetDto) {
    return this.petService.update(id, updatePetDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.petService.remove(id);
  }
}
