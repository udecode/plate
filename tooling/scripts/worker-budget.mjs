import { availableParallelism, totalmem } from 'node:os';

// The largest worker this budget sizes, measured on 2026-11-23: a plitejs bun
// test batch of the package tests, at a 3.77 GiB footprint.
const SLOT_BYTES = 3.8 * 1024 ** 3;

/**
 * Starts no more of the largest workers than fit in half the memory, because
 * `.agents/pstack/proof.mjs` stops a command that uses more than half of the
 * machine's memory.
 */
export const workerBudget = ({
  cores = availableParallelism(),
  env = process.env,
  memory = totalmem(),
} = {}) => {
  const override = Number(env.CHECK_CORES);
  if (Number.isInteger(override) && override > 0) return override;
  return Math.max(
    1,
    Math.min(Math.ceil(cores / 2), Math.floor(memory / 2 / SLOT_BYTES))
  );
};
