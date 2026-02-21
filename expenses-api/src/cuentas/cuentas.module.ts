import { Module } from '@nestjs/common';
import { CuentasController } from './cuentas.controller';
import { CuentasService } from './cuentas.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CuentasController],
  providers: [CuentasService],
})
export class CuentasModule {}
