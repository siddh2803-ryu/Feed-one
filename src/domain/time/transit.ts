/**
 * Feed One Domain: Transit Buffer Calculations
 */
export function estimateTransitMinutes(distanceKm: number, averageSpeedKmh: number = 30): number {
  if (distanceKm <= 0) return 0;
  const transitHours = distanceKm / averageSpeedKmh;
  return Math.ceil(transitHours * 60);
}

export function isTransitFeasible(
  availableWindowMinutes: number,
  distanceKm: number,
  minHandoffSlotMinutes: number = 30
): boolean {
  const transit = estimateTransitMinutes(distanceKm);
  return availableWindowMinutes >= (transit + minHandoffSlotMinutes);
}
