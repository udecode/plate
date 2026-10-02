import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';

import {
  type DeviceWitnessRule,
  type DeviceWitnessStep,
  judgeDeviceWitness,
} from '../../src/device/witness';
import type { BrowserNativeEventTraceEntry } from '../../src/playwright/types';

type Fixture = {
  events: BrowserNativeEventTraceEntry[];
  name: string;
  steps: DeviceWitnessStep[];
};

// Recorded on an emulator by tooling/device/record-witness-fixtures.mjs.
const fixtures = JSON.parse(
  readFileSync(
    new URL('fixtures/device-witness-traces.json', import.meta.url),
    'utf-8'
  )
) as Fixture[];

const rulesFor = (name: string) => {
  const fixture = fixtures.find((candidate) => candidate.name === name);

  if (!fixture) throw new Error(`No recorded trace named ${name}.`);
  return [
    ...new Set(
      judgeDeviceWitness({ events: fixture.events, steps: fixture.steps }).map(
        (violation) => violation.rule
      )
    ),
  ].sort();
};

describe('device witness over real emulator traces', () => {
  test('accepts real soft-keyboard typing', () => {
    expect(rulesFor('real-typing')).toEqual([]);
  });

  test.each<[string, DeviceWitnessRule[]]>([
    ['content-tap-miss', ['pointer-miss']],
    ['adb-input-keyevent-outside', ['outside-window']],
    ['adb-input-keyevent-inside', ['wrong-key']],
    // Enter during a letter tap: a soft-keyboard key, but not this step's.
    ['adb-input-enter-inside', ['wrong-key']],
    ['cdp-insert-text-inside', ['unpaired-input']],
    // execCommand fires a trusted input event with no beforeinput.
    ['script-exec-command-inside', ['unpaired-input']],
    ['script-beforeinput-inside', ['unpaired-input', 'untrusted']],
  ])('rejects %s', (name, rules) => {
    expect(rulesFor(name)).toEqual(rules);
  });

  test('rejects key steps whose trace never arrived', () => {
    const typing = fixtures.find((fixture) => fixture.name === 'real-typing');

    expect(
      judgeDeviceWitness({ events: [], steps: typing?.steps ?? [] }).map(
        (violation) => violation.rule
      )
    ).toEqual(['missing-key', 'missing-key', 'missing-key']);
  });
});
