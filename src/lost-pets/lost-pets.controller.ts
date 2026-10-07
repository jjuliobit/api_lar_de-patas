import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LostPetsService } from './lost-pets.service';
import { CreateLostPetDto } from './dto/create-lost-pet.dto';
import { UpdateLostPetDto } from './dto/update-lost-pet.dto';

@Controller('lost-pets')
export class LostPetsController {
  constructor(private readonly lostPetsService: LostPetsService) {}

  @Post()
  create(@Body() createLostPetDto: CreateLostPetDto) {
    return this.lostPetsService.create(createLostPetDto);
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
