import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLostPetDto } from './dto/create-lost-pet.dto';
import { UpdateLostPetDto } from './dto/update-lost-pet.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class LostPetsService {
  constructor(private readonly databaseService: DatabaseService) { }
  async create(createLostPetDto: CreateLostPetDto) {
    try {
      const lostPet = await this.databaseService.lostPet.create({
        data: {
          ...createLostPetDto,
          userId: createLostPetDto.userId,
        }
      })

      return lostPet;

    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    const lostPets = await this.databaseService.lostPet.findMany({
      include: {
        user: {
          select: {
            nome: true,
            sobrenome: true,
            email: true,
            telefone: true,
          }
        }
      },
    });

    if (!lostPets) {
      throw new NotFoundException('Não foram encontrados animais perdidos');
    }

    return lostPets;
  }

  async findOne(id: string) {
    try {
      const lostPet = await this.databaseService.lostPet.findUnique({
        where: { id },
      })

      if (!lostPet) {
        throw new NotFoundException('Animal perdido não encontrado');
      }

      return lostPet;

    } catch (error) {
      throw error;
    }

  }

  async update(id: string, updateLostPetDto: UpdateLostPetDto) {
    const {
      userId: _userId,
      ...data
    } = updateLostPetDto;

    const lostPet = await this.databaseService.lostPet.update({
      where: { id },
      data,
    })

    return {
      lostPet,
      mensagem: 'Animal perdido atualizado com sucesso'
    }
  }

  async remove(id: string) {
    const lostPet = await this.databaseService.lostPet.delete({
      where: { id },
    })

    if (!lostPet) {
      throw new NotFoundException('Animal perdido não encontrado');
    }

    return {
      mensagem: 'Animal perdido removido com sucesso'
    }
  }
}
