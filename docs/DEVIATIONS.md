# Feed One: Deviations Register

This document tracks any intentional or forced deviations from the project reference or specifications, the rationale, and the affected requirement IDs.

| Date | Requirement ID | Original Specification | Implemented Behavior | Rationale & Trade-offs | Status |
|---|---|---|---|---|---|
| 2026-10-19 | Ref §12.1 | "Recipient declined" listed as a top-level donation status. | "Declined" is strictly an offer status (`offers.status = 'declined'`). A decline transitions the donation back to `match_recommended` or `no_match`. | Eliminates invalid cyclic state machine behavior and preserves donation lifecycle integrity. | Active |
| 2026-10-19 | Ref §11 | Journey diagram looped expired/cancelled donations back into matching. | `cancelled` and `pickup_expired` are strictly terminal states (except the 24h operational correction D19). | Prevents revived ghost donations and race conditions. | Active |
| 2026-10-19 | Ref §8.2.1 | C3 stated "leaving at least 30 min before the deadline" without algorithm specification. | Implemented D29: $W = [\max(\text{available\_from}, \text{now}), \text{pickup\_deadline}]$, intersected with weekly recurring collection slots in `REGION_TIMEZONE`, requiring at least one feasible slot $\ge 30\text{ min}$. | Ensures deterministic window evaluation accounting for current time and timezone boundary crossings. | Active |
| 2026-10-19 | Ref §12.1 | "Matching in Progress" listed as a potential donation state. | "Matching in Progress" is implemented as an ephemeral client-side loading state during the synchronous matching call. | Keeps database states discrete, ACID-compliant, and prevents stuck transient states. | Active |
