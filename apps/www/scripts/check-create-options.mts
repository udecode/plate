import { setTimeout } from 'node:timers/promises';

import {
  createPlateCreateConfig,
  getPlateCreateOptions,
  getPlateCreatePreset,
  PLATE_DEFAULT_CREATE_CONFIG,
  type PlateCreateConfig,
} from '@/lib/plate-create';
import {
  fetchPlateCreateTheme,
  ShadcnAnswerError,
} from '@/lib/plate-create-theme';
import { PLATE_REGISTRY_BASES } from '@/lib/plate-registry-styles';

const CONCURRENCY = 6;
const RETRIES = 2;

type Case = { base: PlateCreateConfig['base']; label: string; preset: string };
type Outcome = 'passed' | 'rejected' | 'unreachable';

const isUnreachable = (error: unknown) =>
  error instanceof ShadcnAnswerError
    ? error.status >= 500 || error.status === 429
    : error instanceof TypeError;

const cases = new Map<string, Case>();

for (const base of PLATE_REGISTRY_BASES) {
  const options = getPlateCreateOptions({
    ...PLATE_DEFAULT_CREATE_CONFIG,
    base,
  });

  for (const [row, values] of Object.entries(options)) {
    for (const value of values) {
      const preset = getPlateCreatePreset(
        createPlateCreateConfig({ base, [row]: value })
      );
      const key = `${base} ${preset}`;

      if (!cases.has(key)) {
        cases.set(key, { base, label: `${base} ${row}=${value}`, preset });
      }
    }
  }
}

const check = async ({ base, label, preset }: Case): Promise<Outcome> => {
  for (let attempt = 0; ; attempt++) {
    try {
      await fetchPlateCreateTheme(base, preset);

      return 'passed';
    } catch (error) {
      if (isUnreachable(error) && attempt < RETRIES) {
        await setTimeout(1000 * (attempt + 1));
        continue;
      }

      const message = error instanceof Error ? error.message : String(error);

      if (isUnreachable(error)) {
        console.error(
          `${label} (${preset}): shadcn did not answer: ${message}`
        );

        return 'unreachable';
      }

      console.error(`${label} (${preset}): shadcn rejected it: ${message}`);

      return 'rejected';
    }
  }
};

const pending = [...cases.values()];
const outcomes: Outcome[] = [];

await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (let next = pending.shift(); next; next = pending.shift()) {
      outcomes.push(await check(next));
    }
  })
);

const count = (outcome: Outcome) =>
  outcomes.filter((result) => result === outcome).length;

if (count('rejected') > 0) {
  console.error(
    `shadcn rejected ${count('rejected')} of ${cases.size} /create presets; drop each rejected value from what plate-create.ts offers.`
  );
  process.exit(1);
}
if (count('unreachable') > 0) {
  console.error(
    `shadcn did not answer ${count('unreachable')} of ${cases.size} /create presets after ${RETRIES} retries.`
  );
  process.exit(2);
}

console.info(`shadcn served all ${cases.size} /create presets.`);
