/**
 * Feed One: Automated Data Hygiene & Notification Purging (Q6)
 */
export function purgeNotificationsBefore(
  notifications: Array<{ id: string; createdAt: string }>,
  retentionDays: number = 90
): Array<{ id: string; createdAt: string }> {
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  return notifications.filter(n => new Date(n.createdAt).getTime() >= cutoff);
}
