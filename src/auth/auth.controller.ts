import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Req,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() createAuthDto: CreateAuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(createAuthDto);

    // Configurar cookie com o sessionId
    response.cookie('sessionId', result.sessionId, {
      httpOnly: true, // Não acessível via JavaScript
      secure: process.env.NODE_ENV === 'production', // HTTPS em produção
      sameSite: 'strict', // Proteção CSRF
      maxAge: 15 * 60 * 1000, // 15 minutos em milissegundos
    });

    return {
      mensagem: 'Login realizado com sucesso',
      user: result.user,
      expiresAt: result.expiresAt,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const sessionId = request.cookies?.sessionId;

    if (!sessionId) {
      throw new UnauthorizedException('Nenhuma sessão ativa');
    }

    await this.authService.logout(sessionId);

    // Limpar cookie
    response.clearCookie('sessionId');

    return {
      mensagem: 'Logout realizado com sucesso',
    };
  }

  @Get('me')
  async getProfile(@Req() request: Request) {
    const sessionId = request.cookies?.sessionId;

    if (!sessionId) {
      throw new UnauthorizedException('Nenhuma sessão ativa');
    }

    const { user } = await this.authService.validateSession(sessionId);

    return {
      user,
    };
  }
}
