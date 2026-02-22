import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PresupuestosService {
  constructor(private prisma: PrismaService) {}

  async crear(data: {
    cantidad: number;
    mes: number;
    anio: number;
    categoriaId: number;
    usuarioId: number;
  }) {
    return this.prisma.presupuesto.create({
      data: {
        cantidad: data.cantidad,
        mes: data.mes,
        anio: data.anio,
        categoriaId: data.categoriaId,
        usuarioId: data.usuarioId,
      },
      include: {
        categoria: true,
      },
    });
  }

  async listar(usuarioId: number, anio?: number, mes?: number) {
    const where: Prisma.PresupuestoWhereInput = { usuarioId };
    if (anio) where.anio = anio;
    if (mes) where.mes = mes;

    return this.prisma.presupuesto.findMany({
      where,
      include: {
        categoria: true,
      },
      orderBy: [
        { anio: 'desc' },
        { mes: 'desc' },
      ],
    });
  }

  async obtenerUno(id: number) {
    return this.prisma.presupuesto.findUnique({
      where: { id },
      include: {
        categoria: true,
      },
    });
  }

  async actualizar(id: number, data: Prisma.PresupuestoUpdateInput) {
    return this.prisma.presupuesto.update({
      where: { id },
      data,
      include: {
        categoria: true,
      },
    });
  }

  async eliminar(id: number) {
    return this.prisma.presupuesto.delete({
      where: { id },
    });
  }
}
