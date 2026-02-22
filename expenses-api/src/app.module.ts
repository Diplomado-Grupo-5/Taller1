import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { CategoriasModule } from './categorias/categorias.module';
import { GastosModule } from './gastos/gastos.module';
import { CuentasModule } from './cuentas/cuentas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AutenticacionModule } from './autenticacion/autenticacion.module';
import { IngresosModule } from './ingresos/ingresos.module';
import { PresupuestosModule } from './presupuestos/presupuestos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    HealthModule,
    CategoriasModule,
    GastosModule,
    CuentasModule,
    UsuariosModule,
    AutenticacionModule,
    IngresosModule,
    PresupuestosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
