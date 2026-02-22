import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CrearCuentaInput = {
  usuarioId: number;
  nombre: string;
};

type ActualizarCuentaInput = {
  nombre?: string;
};

@Injectable()
export class CuentasService {
  constructor(private readonly prisma: PrismaService) {}

  crear(data: CrearCuentaInput) {
    return this.prisma.cuenta.create({ data });
  }

  obtenerTodos(usuarioId?: number) {
    return this.prisma.cuenta.findMany({
      where: usuarioId ? { usuarioId } : undefined,
      orderBy: { nombre: 'asc' },
    });
  }

  obtenerUno(id: number) {
    return this.prisma.cuenta.findUnique({
      where: { id },
    });
  }

  actualizar(id: number, data: ActualizarCuentaInput) {
    return this.prisma.cuenta.update({
      where: { id },
      data,
    });
  }

  eliminar(id: number) {
    return this.prisma.cuenta.delete({
      where: { id },
    });
  }
}
