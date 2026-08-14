const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const clientes = await prisma.cliente.findMany({
    where: { nombreCompleto: { contains: "REYNOSO", mode: "insensitive" } },
    include: { operaciones: { include: { vehiculo: true } } }
  });
  
  console.log(JSON.stringify(clientes, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
