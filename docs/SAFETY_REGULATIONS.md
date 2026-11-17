# Feed One: Food Safety Screening & Regulatory Mapping

This document maps the Feed One deterministic safety rules (S1–S10) against global food donation guidelines and good samaritan food donation protection acts.

## Starter Rule Mapping Table

| Rule | Trigger Condition | Status | Rationale |
|---|---|---|---|
| **S1** | Use-by date has passed | `blocked` | Expired food cannot be distributed under public health statutes. |
| **S2** | Use-by date before pickup deadline | `blocked` | Guarantees recipient has adequate shelf-life upon receipt. |
| **S3** | Category marked as 'other' | `needs_review` | Non-standard categories require coordinator inspection. |
| **S4** | Chilled, frozen, or hot-held food | `needs_review` | Cold-chain maintenance protocols must be verified. |
| **S5** | Unpackaged or unsealed items | `needs_review` | Risk of contamination during transit requires review. |
| **S6** | Missing use-by date | `needs_review` | Shelf-life must be attested prior to dispatch. |
| **S7** | Ambient, sealed staple foods | `eligible_by_rules` | Low-risk shelf-stable staples qualify for automatic matching. |
| **S8** | High-risk cooked meals & dairy | `needs_review` | Prepared foods require temperature logging and rapid dispatch. |
| **S9** | Frozen food transport check | `needs_review` | Verified insulated containers required for frozen items. |
| **S10**| Hot-held duration > 4 hours | `blocked` | Exceeds bacteriological safety threshold for hot holding. |
