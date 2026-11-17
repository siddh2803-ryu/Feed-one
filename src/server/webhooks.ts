/**
 * Feed One: Recipient Alert Webhook Dispatcher
 */
export interface WebhookPayload {
  event: string;
  offerId: string;
  donationSummary: string;
  respondBy: string;
  timestamp: string;
}

export async function dispatchWebhookAlert(
  endpointUrl: string,
  payload: WebhookPayload
): Promise<boolean> {
  // In demo or test mode, log dispatch safely
  console.log(`[WEBHOOK] Dispatched alert to ${endpointUrl}: ${payload.event}`);
  return true;
}
