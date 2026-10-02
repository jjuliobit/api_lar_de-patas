import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from 'src/database/database.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private readonly databaseService: DatabaseService) { }

  /**
   * Cria a sessão do usuário. Centralizado porque login e register
   * precisam emitir o mesmo cookie com a mesma expiração.
   */
  private async createSession(userId: string) {
    // Expira em 15 minutos
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    return this.databaseService.session.create({
      data: {
        userId,
        expiresAt,
      },
    });
  }

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

    const session = await this.createSession(user.id);

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
            createdAt: true,
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


  async register(createUserDto: CreateUserDto) {
    try {
      const { password, address, ...userData } = createUserDto;
      const passwordHash = await bcrypt.hash(password, 6);

      const user = await this.databaseService.user.create({
        data: {
          ...userData,
          account: {
            create: {
              passwordHash
            }
          },
          address: {
            create: address
          }
        },
        include: {
          address: true
        }
      })

      // Abre sessão junto com o cadastro, para o usuário não ter
      // que digitar e-mail e senha logo em seguida.
      const session = await this.createSession(user.id);

      return {
        sessionId: session.id,
        user: {
          id: user.id,
          nome: user.nome,
          sobrenome: user.sobrenome,
          email: user.email,
        },
        expiresAt: session.expiresAt
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const field = error.meta?.target
        if (Array.isArray(field)) {

          if (field?.includes('cpf')) {
            throw new ConflictException('CPF já cadastrado')
          }

          if (field?.includes('email')) {
            throw new ConflictException('E-mail já cadastrado')
          }
        }
      }
      throw error;
    }


  }
}
