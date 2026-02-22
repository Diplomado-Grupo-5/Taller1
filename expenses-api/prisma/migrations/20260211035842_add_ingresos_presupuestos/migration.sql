/*
  Warnings:

  - You are about to drop the column `tipo` on the `Categoria` table. All the data in the column will be lost.
  - You are about to drop the column `categoriaId` on the `Ingreso` table. All the data in the column will be lost.
  - You are about to drop the column `monto` on the `Presupuesto` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nombre,usuarioId]` on the table `Categoria` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[categoriaId,mes,anio]` on the table `Presupuesto` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cantidad` to the `Presupuesto` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Ingreso" DROP CONSTRAINT "Ingreso_categoriaId_fkey";

-- DropIndex
DROP INDEX "Categoria_nombre_usuarioId_tipo_key";

-- DropIndex
DROP INDEX "Presupuesto_usuarioId_categoriaId_mes_anio_key";

-- AlterTable
ALTER TABLE "Categoria" DROP COLUMN "tipo";

-- AlterTable
ALTER TABLE "Ingreso" DROP COLUMN "categoriaId";

-- AlterTable
ALTER TABLE "Presupuesto" DROP COLUMN "monto",
ADD COLUMN     "cantidad" DECIMAL(10,2) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_usuarioId_key" ON "Categoria"("nombre", "usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Presupuesto_categoriaId_mes_anio_key" ON "Presupuesto"("categoriaId", "mes", "anio");
