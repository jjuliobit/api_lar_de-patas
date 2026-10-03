import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { DatabaseService } from 'src/database/database.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PaginationQueryDto } from './dto/pagination-querry.dto';
import {
  petPhotoPublicPath,
  PET_PHOTO_SERVE_ROOT,
  UPLOAD_ROOT,
} from 'src/upload/upload.config';

@Injectable()
export class PetService {
  constructor(
    private readonly databaseService: DatabaseService
  ) { }

  async create(createPetDto: CreatePetDto, file?: Express.Multer.File) {
    try {
      const pet = await this.databaseService.pet.create({
        data: {
          ...createPetDto,
          foto: file ? petPhotoPublicPath(file.filename) : null,
        }
      })


      return {
        pet,
        mensagem: `Pet cadastrado com sucesso`
      }

    } catch (error) {
      throw error;
    }
  }

  async findAll(paginationQueryDto: PaginationQueryDto) {
    const page = paginationQueryDto.page || 1;
    const limit = paginationQueryDto.limit || 10;
    const skip = (page - 1) * limit;

    const [pets, totalItems] = await this.databaseService.$transaction([
      this.databaseService.pet.findMany({
        include: {
          user: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.databaseService.pet.count(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: pets,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    };
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

      // Apagar a linha não apaga o arquivo: sem isto uploads/pets cresce sem
      // limite com pets que já não existem.
      await this.deletePhotoFile(pets.foto)

      return {
        pets
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`ID: ${id} invalido`)
      }
      throw error;
    }
  }

  /**
   * Remove o arquivo de uma foto já persistida. Silencia ENOENT porque o
   * registro pode apontar para um arquivo que já foi limpo do disco.
   */
  private async deletePhotoFile(foto: string | null): Promise<void> {
    if (!foto || !foto.startsWith(PET_PHOTO_SERVE_ROOT)) return;

    // Resolve sempre dentro de UPLOAD_ROOT: um valor de banco adulterado não
    // pode transformar isto em uma remoção de arquivo fora do diretório.
    const relative = foto.slice(PET_PHOTO_SERVE_ROOT.length + 1);
    const absolute = join(UPLOAD_ROOT, relative);
    if (!absolute.startsWith(UPLOAD_ROOT)) return;

    try {
      await unlink(absolute);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== 'ENOENT') throw error;
    }
  }
}
