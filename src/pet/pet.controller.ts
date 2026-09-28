import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PetService } from './pet.service';
import { Prisma } from '@prisma/client';

@Controller('pet')
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Post()
  create(@Body() createPetDto: Prisma.PetUncheckedCreateInput) {
    return this.petService.create(createPetDto);
  }

  @Get()
  findAll() {
    return this.petService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.petService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePetDto: Prisma.PetUpdateInput) {
    return this.petService.update(id, updatePetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.petService.remove(id);
  }
}
