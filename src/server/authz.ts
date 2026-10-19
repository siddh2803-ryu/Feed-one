/**
 * Feed One Server: Authorization Policy Engine
 * Traceability: PRD §5.2, Ref §5
 *
 * Implements strict role-based access control and resource ownership checks.
 */

export type AppUserRole = "donor" | "recipient" | "coordinator";

export interface AuthUser {
  id: string;
  role: AppUserRole;
  donorId?: string | null;
  recipientId?: string | null;
  isDemo?: boolean;
}

export type AuthAction =
  | "create_donation"
  | "edit_donation"
  | "cancel_donation"
  | "view_donation"
  | "view_candidates"
  | "send_offer"
  | "withdraw_offer"
  | "accept_offer"
  | "decline_offer"
  | "record_collected"
  | "record_delivered"
  | "operational_correction"
  | "review_safety"
  | "manage_directory"
  | "run_discovery"
  | "convert_lead"
  | "view_metrics"
  | "view_audit_log"
  | "manage_settings";

export interface ResourceContext {
  donorId?: string | null;
  recipientId?: string | null;
  offeredRecipientIds?: string[];
  acceptedRecipientId?: string | null;
}

export function can(
  user: AuthUser,
  action: AuthAction,
  resource?: ResourceContext
): boolean {
  // Coordinator has administrative oversight across most operational resources
  if (user.role === "coordinator") {
    const coordinatorAllowed: AuthAction[] = [
      "cancel_donation",
      "view_donation",
      "view_candidates",
      "withdraw_offer",
      "operational_correction",
      "review_safety",
      "manage_directory",
      "run_discovery",
      "convert_lead",
      "view_metrics",
      "view_audit_log",
      "manage_settings",
    ];
    return coordinatorAllowed.includes(action);
  }

  // Donor Actions
  if (user.role === "donor") {
    const isOwner = Boolean(
      resource?.donorId && user.donorId && resource.donorId === user.donorId
    );

    switch (action) {
      case "create_donation":
        return true;
      case "edit_donation":
      case "cancel_donation":
      case "view_donation":
      case "view_candidates":
      case "send_offer":
      case "withdraw_offer":
      case "record_collected":
        return isOwner;
      case "view_metrics":
      case "view_audit_log":
        return true; // scoped in query
      default:
        return false;
    }
  }

  // Recipient Actions
  if (user.role === "recipient") {
    const isRecipientOfOffer = Boolean(
      user.recipientId &&
        (resource?.recipientId === user.recipientId ||
          resource?.offeredRecipientIds?.includes(user.recipientId))
    );
    const isAcceptedRecipient = Boolean(
      user.recipientId &&
        resource?.acceptedRecipientId &&
        resource.acceptedRecipientId === user.recipientId
    );

    switch (action) {
      case "view_donation":
        return isRecipientOfOffer || isAcceptedRecipient;
      case "accept_offer":
      case "decline_offer":
        return isRecipientOfOffer;
      case "record_collected":
      case "record_delivered":
        return isAcceptedRecipient;
      case "view_metrics":
      case "view_audit_log":
        return true;
      default:
        return false;
    }
  }

  return false;
}
