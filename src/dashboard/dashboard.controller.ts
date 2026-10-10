import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats(@CurrentUser() user: { id: string }) {
    return this.dashboardService.getStats(user.id);
  }
}
