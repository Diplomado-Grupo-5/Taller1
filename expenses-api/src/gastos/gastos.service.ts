import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CrearGastoInput = {
  descripcion: string;
  monto: number;
  fecha: string;
  categoriaId?: number | null;
  cuentaId?: number | null;
  comercio?: string | null;
  usuarioId?: number | null;
};

type ActualizarGastoInput = {
  descripcion?: string;
  monto?: number;
  fecha?: string;
  categoriaId?: number | null;
  cuentaId?: number | null;
  comercio?: string | null;
  usuarioId?: number | null;
};

@Injectable()
export class GastosService {
  constructor(private readonly prisma: PrismaService) {}

  crear(data: CrearGastoInput) {
    return this.prisma.gasto.create({
      data: {
        descripcion: data.descripcion,
        monto: data.monto,
        fecha: new Date(data.fecha),
        categoriaId: data.categoriaId ?? null,
        cuentaId: data.cuentaId ?? null,
        comercio: data.comercio ?? null,
        usuarioId: data.usuarioId ?? null,
      },
      include: { categoria: true, cuenta: true },
    });
  }

  obtenerTodos(usuarioId?: number) {
    return this.prisma.gasto.findMany({
      where: usuarioId ? { usuarioId } : {},
      orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
      include: { categoria: true, cuenta: true },
    });
  }

  obtenerUno(id: number) {
    return this.prisma.gasto.findUnique({
      where: { id },
      include: { categoria: true, cuenta: true },
    });
  }

  actualizar(id: number, data: ActualizarGastoInput) {
    return this.prisma.gasto.update({
      where: { id },
      data: {
        descripcion: data.descripcion,
        monto: data.monto,
        fecha: data.fecha ? new Date(data.fecha) : undefined,
        categoriaId: data.categoriaId ?? undefined,
        cuentaId: data.cuentaId ?? undefined,
        comercio: data.comercio ?? undefined,
        usuarioId: data.usuarioId ?? undefined,
      },
      include: { categoria: true, cuenta: true },
    });
  }

  eliminar(id: number) {
    return this.prisma.gasto.delete({
      where: { id },
    });
  }
}
