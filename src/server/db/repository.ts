/**
 * Feed One: Repository Abstraction Interface
 */
import { DonationRecord, RecipientRecord, OfferRecord } from "./schema";

export interface IFeedOneRepository {
  getDonation(id: string): Promise<DonationRecord | null>;
  listRecipients(): Promise<RecipientRecord[]>;
  getOffer(id: string): Promise<OfferRecord | null>;
}
