import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AdoptionService } from './adoption.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CreateAdoptionDto } from './dto/create-adoption.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('adoption')
@UseGuards(AuthGuard)
export class AdoptionController {
  constructor(
    private readonly adoptionService: AdoptionService,
  ) {}

  /**
   * Criar uma solicitação de adoção.
   * POST /api/adoption
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createAdoptionDto: CreateAdoptionDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.adoptionService.create(createAdoptionDto, user.id);
  }

  /**
   * Listar adoções recebidas (onde o usuário é dono do pet).
   * GET /api/adoption/received
   */
  @Get('received')
  @HttpCode(HttpStatus.OK)
  getReceivedAdoptions(@CurrentUser() user: { id: string }) {
    return this.adoptionService.getReceivedAdoptions(user.id);
  }

  /**
   * Listar adoções enviadas (onde o usuário é o solicitante).
   * GET /api/adoption/sent
   */
  @Get('sent')
  @HttpCode(HttpStatus.OK)
  getSentAdoptions(@CurrentUser() user: { id: string }) {
    return this.adoptionService.getSentAdoptions(user.id);
  }

  /**
   * Concluir uma adoção (transfere o pet para o solicitante).
   * PATCH /api/adoption/:id/complete
   */
  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  completeAdoption(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.adoptionService.completeAdoption(
      id,
      user.id,
    );
  }

  /**
   * Rejeitar uma solicitação de adoção.
   * PATCH /api/adoption/:id/reject
   */
  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  rejectAdoption(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.adoptionService.rejectAdoption(id, user.id);
  }
}