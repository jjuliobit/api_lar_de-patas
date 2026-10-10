
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from 'src/database/database.service';
import { CreateAdoptionDto } from './dto/create-adoption.dto';

@Injectable()
export class AdoptionService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  /**
   * Criar uma solicitação de adoção.
   */
  async create(createAdoptionDto: CreateAdoptionDto, userId: string) {
    const { petId, observacoes } = createAdoptionDto;

    // 1. Verificar se o pet existe
    const pet = await this.databaseService.pet.findUnique({
      where: { id: petId },
    });

    if (!pet) {
      throw new NotFoundException('Animal não encontrado');
    }

    // 2. Impedir que o dono solicite a adoção do próprio animal
    if (pet.userId === userId) {
      throw new BadRequestException(
        'Você não pode solicitar a adoção do seu próprio animal',
      );
    }

    // 3. Verificar se o pet está disponível
    if (pet.status === 'Adotado') {
      throw new BadRequestException('Este animal já foi adotado');
    }

    // 4. Verificar se já existe uma solicitação pendente
    const existingAdoption = await this.databaseService.adoption.findUnique({
      where: {
        petId_userId: {
          petId,
          userId,
        },
      },
    });

    if (existingAdoption) {
      if (['Enviado', 'Analisando'].includes(existingAdoption.status)) {
        throw new ConflictException(
          'Você já possui uma solicitação pendente para este animal',
        );
      }
      // Se foi rejeitada antes, permite criar nova
      if (existingAdoption.status === 'Rejeitado') {
        return this.databaseService.adoption.update({
          where: { id: existingAdoption.id },
          data: {
            status: 'Enviado',
            observacoes,
            updatedAt: new Date(),
          },
        });
      }
    }

    // 5. Criar a solicitação
    const adoption = await this.databaseService.adoption.create({
      data: {
        petId,
        userId,
        observacoes,
        status: 'Enviado',
      },
    });

    // 6. Atualizar status do pet para EmProcesso se estiver Disponivel
    if (pet.status === 'Disponivel') {
      await this.databaseService.pet.update({
        where: { id: petId },
        data: { status: 'EmProcesso' },
      });
    }

    return adoption;
  }

  /**
   * Listar adoções recebidas (onde o usuário é dono do pet).
   */
  async getReceivedAdoptions(ownerId: string) {
    return this.databaseService.adoption.findMany({
      where: {
        pet: {
          userId: ownerId,
        },
      },
      include: {
        pet: true,
        user: {
          select: {
            id: true,
            nome: true,
            sobrenome: true,
            email: true,
            telefone: true,
            foto: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Listar adoções enviadas (onde o usuário é o solicitante).
   */
  async getSentAdoptions(userId: string) {
    return this.databaseService.adoption.findMany({
      where: {
        userId,
      },
      include: {
        pet: {
          include: {
            user: {
              select: {
                id: true,
                nome: true,
                sobrenome: true,
                email: true,
                telefone: true,
                foto: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Rejeitar uma solicitação de adoção.
   */
  async rejectAdoption(id: string, ownerId: string) {
    // 1. Buscar a solicitação e o animal
    const adoption = await this.databaseService.adoption.findUnique({
      where: { id },
      include: {
        pet: true,
      },
    });

    if (!adoption) {
      throw new NotFoundException(
        'Solicitação de adoção não encontrada',
      );
    }

    const pet = adoption.pet;

    // 2. Verificar se quem está rejeitando é o dono atual
    if (pet.userId !== ownerId) {
      throw new ForbiddenException(
        'Você não é o responsável atual por este animal',
      );
    }

    // 3. Verificar o estado da solicitação
    if (!['Enviado', 'Analisando'].includes(adoption.status)) {
      throw new BadRequestException(
        'Esta solicitação já foi processada',
      );
    }

    // 4. Rejeitar a solicitação
    const rejectedAdoption = await this.databaseService.adoption.update({
      where: { id },
      data: {
        status: 'Rejeitado',
      },
    });

    // 5. Se não houver mais solicitações pendentes, voltar pet para Disponivel
    const pendingAdoptions = await this.databaseService.adoption.count({
      where: {
        petId: pet.id,
        status: {
          in: ['Enviado', 'Analisando'],
        },
      },
    });

    if (pendingAdoptions === 0 && pet.status === 'EmProcesso') {
      await this.databaseService.pet.update({
        where: { id: pet.id },
        data: { status: 'Disponivel' },
      });
    }

    return {
      message: 'Solicitação de adoção rejeitada',
      adoption: rejectedAdoption,
    };
  }

  async completeAdoption(
    id: string,
    ownerId: string,
  ) {
    return this.databaseService.$transaction(async (tx) => {
      // 1. Buscar a solicitação e o animal
      const adoption = await tx.adoption.findUnique({
        where: { id },
        include: {
          pet: true,
        },
      });

      if (!adoption) {
        throw new NotFoundException(
          'Solicitação de adoção não encontrada',
        );
      }

      const pet = adoption.pet;

      // 2. Verificar se quem está aceitando é o dono atual
      if (pet.userId !== ownerId) {
        throw new ForbiddenException(
          'Você não é o responsável atual por este animal',
        );
      }

      // 3. Impedir que o dono adote o próprio animal
      if (adoption.userId === ownerId) {
        throw new BadRequestException(
          'Você não pode adotar seu próprio animal',
        );
      }

      // 4. Verificar o estado da solicitação
      if (
        !['Enviado', 'Analisando'].includes(adoption.status)
      ) {
        throw new BadRequestException(
          'Esta solicitação já foi processada',
        );
      }

      // 5. Transferir o animal para quem solicitou a adoção
      // A condição protege contra transferências concorrentes.
      const transfer = await tx.pet.updateMany({
        where: {
          id: pet.id,
          userId: ownerId,
          status: {
            in: ['Disponivel', 'EmProcesso'],
          },
        },
        data: {
          userId: adoption.userId,
          status: 'Adotado',
        },
      });

      if (transfer.count !== 1) {
        throw new ConflictException(
          'O animal já foi transferido ou não está disponível',
        );
      }

      // 6. Marcar a solicitação aceita como concluída
      const updatedAdoption = await tx.adoption.update({
        where: { id },
        data: {
          status: 'Concluido',
        },
      });

      // 7. Rejeitar as outras solicitações pendentes
      await tx.adoption.updateMany({
        where: {
          petId: pet.id,
          id: { not: id },
          status: {
            in: ['Enviado', 'Analisando'],
          },
        },
        data: {
          status: 'Rejeitado',
        },
      });

      // 8. Retornar os dados atualizados
      return {
        message: 'Adoção concluída e animal transferido com sucesso!',
        adoption: updatedAdoption,
        pet: {
          ...pet,
          userId: adoption.userId,
          status: 'Adotado',
        },
      };
    });
  }
}
