import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Req,
  Get,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { CreateAuthDto } from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Detecta se a requisição chegou por HTTPS, considerando proxies.
   * Não usa NODE_ENV porque em desenvolvimento local a API roda em HTTP
   * e um cookie com `Secure` seria descartado pelo navegador.
   */
  private isSecureRequest(request: Request): boolean {
    const forwardedProto = request.headers['x-forwarded-proto'];
    const proto =
      typeof forwardedProto === 'string'
        ? forwardedProto.split(',')[0].trim()
        : forwardedProto?.[0];

    if (proto) return proto === 'https';
    return request.protocol === 'https';
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() createAuthDto: CreateAuthDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(createAuthDto);

    // Configurar cookie com o sessionId
    response.cookie('sessionId', result.sessionId, {
      httpOnly: true, // Não acessível via JavaScript
      secure: this.isSecureRequest(request), // Só marca Secure quando a conexão é HTTPS de fato
      sameSite: 'lax', // Envia em navegação normal; protege contra CSRF em requisições de terceiros
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

    // Limpar o cookie usando as mesmas opções usadas no login,
    // caso contrário o navegador não consegue removê-lo.
    response.clearCookie('sessionId', {
      httpOnly: true,
      secure: this.isSecureRequest(request),
      sameSite: 'lax',
    });

    return {
      mensagem: 'Logout realizado com sucesso',
    };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getProfile(@CurrentUser() user: unknown) {
    return { user };
  }
}
