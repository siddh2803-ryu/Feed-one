/**
 * Feed One: Health Check Diagnostics Telemetry
 */
export interface SystemHealthDiagnostics {
  status: "healthy" | "degraded";
  uptimeSeconds: number;
  memoryUsageMb: number;
  timestamp: string;
}

export function getSystemDiagnostics(): SystemHealthDiagnostics {
  const mem = process.memoryUsage ? process.memoryUsage().heapUsed / (1024 * 1024) : 0;
  return {
    status: "healthy",
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    memoryUsageMb: Math.round(mem * 10) / 10,
    timestamp: new Date().toISOString()
  };
}
