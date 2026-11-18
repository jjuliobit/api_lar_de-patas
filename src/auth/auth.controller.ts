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
import { CreateUserDto } from 'src/user/dto/create-user.dto';

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

  /**
   * Opções iguais no login, no cadastro e no logout. Se divergirem, o
   * navegador guarda o cookie e depois não consegue apagá-lo.
   *
   * `Partitioned` entra só em HTTPS: sem isso, Safari e o navegador do
   * WhatsApp descartam o cookie (a página está na Vercel e a API no Render)
   * e o próximo request volta 401, que a tela mostra como sessão expirada.
   */
  private sessionCookieOptions(request: Request) {
    const isSecure = this.isSecureRequest(request);

    return {
      httpOnly: true,
      secure: isSecure,
      sameSite: (isSecure ? 'none' : 'lax') as 'none' | 'lax',
      partitioned: isSecure,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() createAuthDto: CreateAuthDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(createAuthDto);

    response.cookie('sessionId', result.sessionId, {
      ...this.sessionCookieOptions(request),
      maxAge: 15 * 60 * 1000, // 15 minutos em milissegundos
    });

    return {
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

    response.clearCookie('sessionId', this.sessionCookieOptions(request));

    return {
      mensagem: 'Logout realizado com sucesso',
    };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getProfile(@CurrentUser() user: unknown) {
    return { user };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() createUserDto: CreateUserDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(createUserDto);

    response.cookie('sessionId', result.sessionId, {
      ...this.sessionCookieOptions(request),
      maxAge: 15 * 60 * 1000,
    });

    return {
      user: result.user,
      expiresAt: result.expiresAt,
    };
  }
}
