import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class IngresosService {
  constructor(private prisma: PrismaService) {}

  async crear(data: {
    descripcion: string;
    monto: number;
    fecha: string;
    cuentaId?: number | null;
    usuarioId: number;
  }) {
    return this.prisma.ingreso.create({
      data: {
        descripcion: data.descripcion,
        monto: data.monto,
        fecha: new Date(data.fecha),
        cuentaId: data.cuentaId,
        usuarioId: data.usuarioId,
      },
      include: {
        cuenta: true,
      },
    });
  }

  async listar(usuarioId: number) {
    return this.prisma.ingreso.findMany({
      where: { usuarioId },
      include: {
        cuenta: true,
      },
      orderBy: {
        fecha: 'desc',
      },
    });
  }

  async obtenerUno(id: number) {
    return this.prisma.ingreso.findUnique({
      where: { id },
      include: {
        cuenta: true,
      },
    });
  }

  async actualizar(id: number, data: Prisma.IngresoUpdateInput) {
    return this.prisma.ingreso.update({
      where: { id },
      data,
      include: {
        cuenta: true,
      },
    });
  }

  async eliminar(id: number) {
    return this.prisma.ingreso.delete({
      where: { id },
    });
  }
}
