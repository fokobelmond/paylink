import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrangeMoneyProvider } from './providers/orange-money.provider';
import { MtnMomoProvider } from './providers/mtn-momo.provider';

@Module({
  imports: [NotificationsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, OrangeMoneyProvider, MtnMomoProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}


