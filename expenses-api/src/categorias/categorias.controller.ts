import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CategoriasService } from './categorias.service';

@UseGuards(AuthGuard('jwt'))
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly servicio: CategoriasService) {}

  @Post()
  crear(@Request() req: any, @Body() cuerpo: { nombre: string }) {
    const usuarioId = req.user.id;
    return this.servicio.crear({ nombre: cuerpo.nombre, usuarioId });
  }

  @Get()
  obtenerTodos(@Request() req: any) {
    const usuarioId = req.user.id;
    return this.servicio.obtenerTodos(usuarioId);
  }

  @Get(':id')
  obtenerUno(@Param('id') id: string) {
    return this.servicio.obtenerUno(Number(id));
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() cuerpo: { nombre?: string }) {
    return this.servicio.actualizar(Number(id), { nombre: cuerpo.nombre });
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.servicio.eliminar(Number(id));
  }
}
