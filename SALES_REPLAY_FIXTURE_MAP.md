# Sales Replay Fixture Map

This repository is a synthetic but realistic fixture for CodeRabbit Sales Replay addressed-in-future testing.

Sales Replay selection should pick all 10 merged PRs when target count is 10:

- Tiny bucket (`<=300` changed lines): PR #10, PR #9
- Small bucket (`100-600` changed lines, after tiny picks are removed): PR #8, PR #7, PR #6, PR #5
- Medium bucket (`600-1200` changed lines): PR #4, PR #3, PR #2, PR #1

## Expected Variation

| Source PR | Size | Domain | Intended future status | Evidence |
| --- | ---: | --- | --- | --- |
| #1 Add billing usage ingestion pipeline | 750 | Billing usage ledger | Addressed | Later commit `9f6cdec` changes usage amount normalization from rounding dollars directly to cents conversion. |
| #2 Add workspace export bundle | 701 | Workspace export | Not addressed | CSV export still allows spreadsheet formula-style cell values from notes. |
| #3 Add audit log streaming | 695 | Audit pipeline | Addressed | Later commit `753fe3f` redacts token/secret/password-like metadata before streaming. |
| #4 Add repository sync scheduler | 726 | Repository sync | Not addressed | Cursor persistence/retry behavior is intentionally still fragile. |
| #5 Add checkout session idempotency | 314 | Checkout | Addressed | Later commit `5b77bd4` includes cart id and item fingerprint in the idempotency key. |
| #6 Add webhook delivery verifier | 289 | Webhooks | Not addressed | Signature comparison still uses a normal equality comparison. |
| #7 Add organization role policy checks | 253 | Authorization | Addressed | Later commit `655e2b8` removes broad member access to billing actions. |
| #8 Add CSV report builder | 272 | Reports | Not addressed | Formula-style CSV cells are still emitted without neutralization. |
| #9 Add invite token helper | 18 | Invitations | Addressed | Later commit `cb096c8` switches invite token entropy from `Math.random` to crypto random bytes. |
| #10 Add account timezone formatter | 17 | Account preferences | Not addressed | Configured timezone is still ignored by date formatting. |

## Notes

The future fixes are direct commits on `main`, not PRs. That keeps the merged PR candidate pool at exactly 10 source PRs, so Sales Replay should select the intended fixture PRs instead of selecting the later fixes as replay targets.
