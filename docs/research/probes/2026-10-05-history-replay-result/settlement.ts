type HistoryOutcome =
  | Readonly<{ status: 'applied' | 'empty' | 'busy' }>
  | Readonly<{ conflicts: readonly string[]; status: 'blocked' }>
  | Readonly<{ reason: string; status: 'blocked' }>
  | Readonly<{ status: 'failed' }>;
// Plan round-1 shape.
type Round1 = Extract<HistoryOutcome, { status: 'applied' | 'failed' } | { reason: string }>;
export const round1Applied: Round1 = { status: 'applied' };
// Fixed shape: settlement first, outcome extends it.
type HistorySettlement =
  | Readonly<{ status: 'applied' }>
  | Readonly<{ reason: string; status: 'blocked' }>
  | Readonly<{ status: 'failed' }>;
type FixedOutcome =
  | HistorySettlement
  | Readonly<{ status: 'empty' | 'busy' }>
  | Readonly<{ conflicts: readonly string[]; status: 'blocked' }>;
export const fixedApplied: HistorySettlement = { status: 'applied' };
// @ts-expect-error busy is not a settlement
export const fixedBusy: HistorySettlement = { status: 'busy' };
export const outcomeBusy: FixedOutcome = { status: 'busy' };
