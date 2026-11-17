/**
 * Feed One: Structured JSON Logger with PII Masking
 */
export function sanitizeLogData(data: Record<string, any>): Record<string, any> {
  const sanitized = { ...data };
  if (sanitized.phone) sanitized.phone = "[REDACTED]";
  if (sanitized.email) sanitized.email = "[REDACTED]";
  return sanitized;
}

export function logInfo(message: string, context: Record<string, any> = {}): void {
  console.log(JSON.stringify({
    level: "info",
    message,
    context: sanitizeLogData(context),
    timestamp: new Date().toISOString()
  }));
}
