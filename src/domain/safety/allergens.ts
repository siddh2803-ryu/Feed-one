/**
 * Feed One: Major Allergen Definitions & Screening
 */
export const MAJOR_ALLERGENS = [
  "peanuts",
  "tree_nuts",
  "crustaceans",
  "gluten",
  "soybeans",
  "milk",
  "eggs",
  "fish",
  "sesame"
] as const;

export type MajorAllergen = typeof MAJOR_ALLERGENS[number];

export function hasAllergenConflict(
  donationAllergens: string[] = [],
  excludedAllergens: string[] = []
): boolean {
  if (!donationAllergens.length || !excludedAllergens.length) return false;
  const excludedSet = new Set(excludedAllergens.map(a => a.toLowerCase().trim()));
  return donationAllergens.some(a => excludedSet.has(a.toLowerCase().trim()));
}
