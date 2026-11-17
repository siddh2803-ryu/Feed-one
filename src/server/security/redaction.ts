/**
 * Feed One: Two-Phase Contact Disclosure Redaction
 */
export function redactCandidateDetails<T extends { phone?: string; address?: string }>(
  entity: T,
  isMutuallyConfirmed: boolean
): T {
  if (isMutuallyConfirmed) return entity;
  return {
    ...entity,
    phone: undefined,
    address: undefined
  };
}
