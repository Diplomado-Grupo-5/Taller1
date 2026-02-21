import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CrearCategoriaInput = {
  nombre: string;
};

type ActualizarCategoriaInput = {
  nombre?: string;
};

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  crear(data: CrearCategoriaInput & { usuarioId: number }) {
    return this.prisma.categoria.create({ data });
  }

  obtenerTodos(usuarioId: number) {
    return this.prisma.categoria.findMany({
      where: { usuarioId },
      orderBy: { nombre: 'asc' },
    });
  }

  obtenerUno(id: number) {
    return this.prisma.categoria.findUnique({
      where: { id },
    });
  }

  actualizar(id: number, data: ActualizarCategoriaInput) {
    return this.prisma.categoria.update({
      where: { id },
      data,
    });
  }

  eliminar(id: number) {
    return this.prisma.categoria.delete({
      where: { id },
    });
  }
}
