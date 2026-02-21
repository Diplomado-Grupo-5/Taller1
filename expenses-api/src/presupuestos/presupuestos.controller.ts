import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PresupuestosService } from './presupuestos.service';

@UseGuards(AuthGuard('jwt'))
@Controller('presupuestos')
export class PresupuestosController {
  constructor(private readonly servicio: PresupuestosService) {}

  @Post()
  crear(
    @Request() req: any,
    @Body()
    cuerpo: {
      cantidad: number;
      mes: number;
      anio: number;
      categoriaId: number;
      usuarioId?: number;
    },
  ) {
    const usuarioId = req.user.id;
    return this.servicio.crear({ ...cuerpo, usuarioId });
  }

  @Get()
  listar(
    @Request() req: any,
    @Query('anio') anio?: string,
    @Query('mes') mes?: string,
  ) {
    const usuarioId = req.user.id;
    return this.servicio.listar(
      usuarioId, 
      anio ? Number(anio) : undefined, 
      mes ? Number(mes) : undefined
    );
  }

  @Get(':id')
  obtenerUno(@Param('id') id: string) {
    return this.servicio.obtenerUno(Number(id));
  }

  @Patch(':id')
  actualizar(
    @Param('id') id: string,
    @Body() cuerpo: {
      cantidad?: number;
      mes?: number;
      anio?: number;
      categoriaId?: number;
    },
  ) {
    return this.servicio.actualizar(Number(id), cuerpo);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.servicio.eliminar(Number(id));
  }
}
