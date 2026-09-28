import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

@Injectable()
export class PetService {
  constructor(
    private readonly databaseService: DatabaseService
  ) { }

  async create(createPetDto: CreatePetDto) {
    try {
      const pet = await this.databaseService.pet.create({
        data: createPetDto
      })


      return {
        pet,
        mensagem: `Pet cadastrado com sucesso`
      }

    } catch (error) {
      error
    }
  }

  async findAll() {
    const pets = await this.databaseService.pet.findMany({
      include: {
        user: true
      }
    })

    if (pets.length == 0) {
      throw new NotFoundException('Pets não encontrados')
    }

    return {
      pets
    }
  }

  async findOne(id: string) {
    const pets = await this.databaseService.pet.findUnique({
      where: { id }
    })

    if (!pets) {
      throw new NotFoundException(`ID: ${id} invalido`)
    }

    return {
      pets
    }
  }

  async update(id: string, updatePetDto: UpdatePetDto) {
    try {
      const pet = await this.databaseService.pet.update({
        where: { id },
        data: updatePetDto,
      });

      return {
        pet,
        mensagem: 'Pet atualizado com sucesso',
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Pet com ID ${id} não encontrado`);
      }
      throw error;
    }
  }
  async remove(id: string) {
    try {
      const pets = await this.databaseService.pet.delete({
        where: { id }
      })

      return {
        pets
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`ID: ${id} invalido`)
      }
    }
  }
}
