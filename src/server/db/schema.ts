/**
 * Feed One: Database Schema Definitions
 */
export interface DonationRecord {
  id: string;
  donorId: string;
  category: string;
  title: string;
  quantity: number;
  unit: string;
  status: string;
  createdAt: string;
}

export interface RecipientRecord {
  id: string;
  name: string;
  orgType: string;
  serviceRadiusKm: number;
  capacityKg?: number | null;
  capacityItems?: number | null;
}

export interface OfferRecord {
  id: string;
  donationId: string;
  recipientId: string;
  status: string;
  respondBy: string;
}
