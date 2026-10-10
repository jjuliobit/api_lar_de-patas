import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class DashboardService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getStats(userId: string) {
    // Total de animais cadastrados pelo usuário
    const totalAnimais = await this.databaseService.pet.count({
      where: {
        userId,
      },
    });

    // Adoções em andamento (Enviado ou Analisando) dos pets do usuário
    const adocoesEmAndamento = await this.databaseService.adoption.count({
      where: {
        pet: {
          userId,
        },
        status: {
          in: ['Enviado', 'Analisando'],
        },
      },
    });

    // Adoções concluídas dos pets que eram do usuário
    const adocoesConcluidas = await this.databaseService.adoption.count({
      where: {
        status: 'Concluido',
      },
    });

    // Animais perdidos registrados pelo usuário
    const animaisPerdidosRegistrados = await this.databaseService.lostPet.count({
      where: {
        userId,
        encontrado: false,
      },
    });

    return {
      totalAnimais,
      adocoesEmAndamento,
      adocoesConcluidas,
      animaisPerdidosRegistrados,
    };
  }
}
