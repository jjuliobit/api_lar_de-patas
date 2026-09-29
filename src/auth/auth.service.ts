import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from 'src/database/database.service';
import { CreateAuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly databaseService: DatabaseService) {}

  async login(createAuthDto: CreateAuthDto) {
    const { email, senha } = createAuthDto;

    // Buscar usuário pelo email
    const user = await this.databaseService.user.findUnique({
      where: { email },
      include: {
        account: true,
      },
    });

    if (!user || !user.account) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(
      senha,
      user.account.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    // Criar sessão (expira em 15 minutos)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const session = await this.databaseService.session.create({
      data: {
        userId: user.id,
        expiresAt,
      },
    });

    return {
      sessionId: session.id,
      user: {
        id: user.id,
        nome: user.nome,
        sobrenome: user.sobrenome,
        email: user.email,
      },
      expiresAt: session.expiresAt,
    };
  }

  async validateSession(sessionId: string) {
    const session = await this.databaseService.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            sobrenome: true,
            email: true,
            telefone: true,
            idade: true,
            sexo: true,
            cpf: true,
            foto: true,
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Sessão inválida');
    }

    // Verificar se a sessão expirou
    if (new Date() > session.expiresAt) {
      // Deletar sessão expirada
      await this.databaseService.session.delete({
        where: { id: sessionId },
      });
      throw new UnauthorizedException('Sessão expirada');
    }

    return {
      session,
      user: session.user,
    };
  }

  async logout(sessionId: string) {
    try {
      await this.databaseService.session.delete({
        where: { id: sessionId },
      });

      return {
        mensagem: 'Logout realizado com sucesso',
      };
    } catch (error) {
      throw new NotFoundException('Sessão não encontrada');
    }
  }
}
