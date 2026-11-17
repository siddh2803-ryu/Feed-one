import { z } from "zod";

export const DonationListingSchema = z.object({
  category: z.enum(["bakery", "produce", "packaged_dry", "cooked_meals", "dairy_eggs", "beverages", "other"]),
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  quantity: z.number().positive(),
  unit: z.enum(["items", "kg"]),
  unitLabel: z.string().optional(),
  availableFrom: z.string().datetime(),
  pickupDeadline: z.string().datetime(),
  storageCategory: z.enum(["ambient", "chilled", "frozen", "hot_held"]),
  packagedSealed: z.boolean(),
  preparedAt: z.string().datetime().optional(),
  useBy: z.string().datetime().optional(),
});

export type DonationListingInput = z.infer<typeof DonationListingSchema>;
