import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { dbLogger } from "./logger";

const setup = () => {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    // Return a mock db object that matches the drizzle interface
    return {
      select: () => ({
        from: () => [],
      }),
      insert: () => ({
        values: () => ({
          returning: () => Promise.resolve([]),
        }),
      }),
    } as any;
  }

  // Configure postgres client with performance monitoring
  const queryClient = postgres(process.env.DATABASE_URL, {
    onnotice: process.env.NODE_ENV === 'development' ? console.log : undefined,
    debug: process.env.NODE_ENV === 'development',
    transform: {
      undefined: null,
    },
  });

  // Create drizzle instance with logging enabled in development
  const db = drizzle(queryClient, {
    logger: process.env.NODE_ENV === 'development' ? {
      logQuery: (query: string, params: unknown[]) => {
        const startTime = Date.now();
        dbLogger.log({
          query,
          duration: 0,
          timestamp: new Date(),
          success: true,
        });
      }
    } : undefined
  });

  return db;
};

export default setup();
export { dbLogger };
