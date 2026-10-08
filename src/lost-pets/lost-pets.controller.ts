import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { LostPetsService } from './lost-pets.service';
import { CreateLostPetDto } from './dto/create-lost-pet.dto';
import { UpdateLostPetDto } from './dto/update-lost-pet.dto';
import { imageUploadOptions } from 'src/upload/upload.config';

@Controller('lost-pets')
export class LostPetsController {
  constructor(private readonly lostPetsService: LostPetsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('foto', imageUploadOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nome: { type: 'string' },
        especie: { type: 'string', enum: ['Cachorro', 'Gato', 'Passaro', 'Outro'] },
        sexo: { type: 'string', enum: ['Macho', 'Femea'] },
        raca: { type: 'string' },
        cor: { type: 'string' },
        localizacao: { type: 'string' },
        dataUltimaVez: { type: 'string', format: 'date-time' },
        descricao: { type: 'string' },
        encontrado: { type: 'boolean' },
        nomeContato: { type: 'string' },
        telefoneContato: { type: 'string' },
        emailContato: { type: 'string' },
        userId: { type: 'string' },
        foto: { type: 'string', format: 'binary' },
      },
      required: [
        'nome',
        'especie',
        'localizacao',
        'dataUltimaVez',
        'nomeContato',
        'telefoneContato',
        'emailContato',
        'userId',
      ],
    },
  })
  create(
    @Body() createLostPetDto: CreateLostPetDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.lostPetsService.create(createLostPetDto, file);
  }

  @Get()
  findAll() {
    return this.lostPetsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lostPetsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLostPetDto: UpdateLostPetDto) {
    return this.lostPetsService.update(id, updateLostPetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lostPetsService.remove(id);
  }
}
