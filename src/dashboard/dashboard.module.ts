import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, AuthService, AuthGuard],
})
export class DashboardModule {}
