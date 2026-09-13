import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";

// D1 is accessed through a per-request Workers binding, not a persistent
// connection, so there's no module-level singleton to cache here — each
// call builds a client against the current request's binding.
export async function getPrisma() {
  const { env } = await getCloudflareContext({ async: true });
  return new PrismaClient({ adapter: new PrismaD1(env.DB) });
}
