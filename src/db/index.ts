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

  // Create drizzle instance without built-in logging (we'll handle timing manually)
  const baseDb = drizzle(queryClient);

  // Create a proxy to intercept and time database operations
  const db = new Proxy(baseDb, {
    get(target, prop) {
      const originalMethod = target[prop as keyof typeof target];
      
      // Only wrap methods that return promises (database operations)
      if (typeof originalMethod === 'function') {
        return function(...args: any[]) {
          const result = originalMethod.apply(target, args);
          
          // If it's a promise (database operation), wrap it with timing
          if (result && typeof result.then === 'function') {
            const startTime = Date.now();
            const timestamp = new Date();
            
            return result
              .then((data: any) => {
                const duration = Date.now() - startTime;
                
                if (process.env.NODE_ENV === 'development') {
                  dbLogger.log({
                    query: `${String(prop)}()`,
                    duration,
                    timestamp,
                    success: true,
                  });
                }
                
                return data;
              })
              .catch((error: any) => {
                const duration = Date.now() - startTime;
                
                if (process.env.NODE_ENV === 'development') {
                  dbLogger.log({
                    query: `${String(prop)}()`,
                    duration,
                    timestamp,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                  });
                }
                
                throw error;
              });
          }
          
          return result;
        };
      }
      
      return originalMethod;
    },
  });

  return db;
};

export default setup();
export { dbLogger };
