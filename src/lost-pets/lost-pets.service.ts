import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLostPetDto } from './dto/create-lost-pet.dto';
import { UpdateLostPetDto } from './dto/update-lost-pet.dto';
import { DatabaseService } from 'src/database/database.service';
import { LOST_PET_PHOTO_SUBDIR } from 'src/upload/upload.config';
import { deleteUploadedPhoto, saveUploadedImage } from 'src/upload/photo-storage';

@Injectable()
export class LostPetsService {
  constructor(private readonly databaseService: DatabaseService) { }
  async create(createLostPetDto: CreateLostPetDto, file?: Express.Multer.File) {
    const foto = file
      ? await saveUploadedImage(LOST_PET_PHOTO_SUBDIR, file)
      : null;

    try {
      return await this.databaseService.lostPet.create({
        data: {
          ...createLostPetDto,
          foto,
        },
      });
    } catch (error) {
      await deleteUploadedPhoto(foto);
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
        include: {
          user: {
            select: {
              nome: true,
              sobrenome: true,
              email: true,
              telefone: true,
            }
          }
        }
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

    await deleteUploadedPhoto(lostPet.foto);

    return {
      mensagem: 'Animal perdido removido com sucesso'
    }
  }
}
