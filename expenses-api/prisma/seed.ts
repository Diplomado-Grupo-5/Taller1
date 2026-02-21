import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const correo = 'admin@example.com';
  // Hash password for compatibility if we switch back to auth later
  const contrasena = await bcrypt.hash('123456', 10);

  // Ensure User with ID 1 exists (or at least A user)
  // Upsert ensures we don't create duplicates
  const user = await prisma.usuario.upsert({
    where: { correo },
    update: {}, // Don't change anything if exists
    create: {
      correo,
      nombre: 'Admin User',
      contrasena,
    },
  });

  console.log(`User seeded: ${user.correo} (ID: ${user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
