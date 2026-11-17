/**
 * Feed One: Drizzle ORM PostgreSQL Connection Pool
 */
export interface DatabasePoolConfig {
  connectionString?: string;
  isMemoryFallback: boolean;
}

export function getDatabaseConfig(): DatabasePoolConfig {
  const url = process.env.DATABASE_URL;
  return {
    connectionString: url,
    isMemoryFallback: !url || process.env.STORAGE_MODE === "memory"
  };
}
