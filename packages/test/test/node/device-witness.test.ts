import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';

import {
  type DeviceWitnessRule,
  type DeviceWitnessStep,
  judgeDeviceWitness,
} from '../../src/device/witness';

type Fixture = {
  events: Parameters<typeof judgeDeviceWitness>[0]['events'];
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

// A passing korean-placeholder run of the device lane, with the lane's own
// gesture windows.
const [korean] = JSON.parse(
  readFileSync(
    new URL('fixtures/device-witness-lane-traces.json', import.meta.url),
    'utf-8'
  )
) as Fixture[];

const mi6Enter = JSON.parse(
  readFileSync(
    new URL('fixtures/device-witness-mi6-enter.json', import.meta.url),
    'utf-8'
  )
) as Fixture;

const japaneseEnter = JSON.parse(
  readFileSync(
    new URL('fixtures/device-witness-mi6-japanese-enter.json', import.meta.url),
    'utf-8'
  )
) as Fixture;

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

  test('rejects an input whose beforeinput had another type', () => {
    const typing = fixtures.find((fixture) => fixture.name === 'real-typing');
    // A canceled insertion followed by a trusted deletion, as execCommand can send.
    const events = (typing?.events ?? []).map((event, index, all) =>
      index === all.findIndex((candidate) => candidate.type === 'input')
        ? { ...event, inputType: 'deleteContentBackward' }
        : event
    );

    expect(
      judgeDeviceWitness({ events, steps: typing?.steps ?? [] }).map(
        (violation) => violation.rule
      )
    ).toEqual(['unpaired-input']);
  });

  test('accepts the lane trace of Korean jamo, Enter and script composition ends', () => {
    expect(
      judgeDeviceWitness({ events: korean.events, steps: korean.steps })
    ).toEqual([]);
  });

  test('accepts MI6 Enter with IME companion keydowns in its gesture window', () => {
    expect(
      judgeDeviceWitness({ events: mi6Enter.events, steps: mi6Enter.steps })
    ).toEqual([]);
  });

  test('accepts MI6 Japanese composition commit, second Enter and follow-up typing', () => {
    expect(
      judgeDeviceWitness({
        events: japaneseEnter.events,
        steps: japaneseEnter.steps,
      })
    ).toEqual([]);
  });

  test.each<
    [
      string,
      number,
      Partial<Fixture['events'][number]> | null,
      DeviceWitnessRule[],
    ]
  >([
    ['no live composition', 3, null, ['untrusted', 'wrong-key']],
    ['composition opened in the Enter window', 3, { seq: 23 }, ['wrong-key']],
    ['another pre-step draft', 20, { data: 'にほ' }, ['wrong-key']],
    ['an untrusted key', 23, { isTrusted: false }, ['untrusted', 'wrong-key']],
    ['a non-composing key', 23, { isComposing: false }, ['wrong-key']],
    ['another key', 23, { key: 'a' }, ['wrong-key']],
    ['another key code', 23, { keyCode: 13 }, ['wrong-key']],
    ['a missing key', 23, null, ['missing-key', 'unpaired-input']],
    ['a missing update', 24, null, ['wrong-key']],
    [
      'an untrusted update',
      24,
      { isTrusted: false },
      ['untrusted', 'wrong-key'],
    ],
    ['another update draft', 24, { data: 'にほ' }, ['untrusted', 'wrong-key']],
    ['a missing beforeinput', 25, null, ['unpaired-input', 'wrong-key']],
    [
      'an untrusted beforeinput',
      25,
      { isTrusted: false },
      ['untrusted', 'wrong-key'],
    ],
    ['a non-composing beforeinput', 25, { isComposing: false }, ['wrong-key']],
    ['another beforeinput draft', 25, { data: 'にほ' }, ['wrong-key']],
    [
      'another beforeinput type',
      25,
      { inputType: 'insertText' },
      ['unpaired-input', 'wrong-key'],
    ],
    ['a missing input', 26, null, ['wrong-key']],
    [
      'an untrusted input',
      26,
      { isTrusted: false },
      ['untrusted', 'wrong-key'],
    ],
    ['a non-composing input', 26, { isComposing: false }, ['wrong-key']],
    ['another input draft', 26, { data: 'にほ' }, ['wrong-key']],
    [
      'another input type',
      26,
      { inputType: 'insertText' },
      ['unpaired-input', 'wrong-key'],
    ],
    ['a missing end', 27, null, ['wrong-key']],
    ['another end draft', 27, { data: 'にほ' }, ['untrusted', 'wrong-key']],
    [
      'an Unidentified key after composition ended',
      28,
      { isComposing: true, key: 'Unidentified', keyCode: 229 },
      ['wrong-key'],
    ],
    ['a missing content touch', 1, null, ['missing-pointer']],
  ])('rejects a Japanese Enter trace with %s', (_name, seq, patch, rules) => {
    const events = japaneseEnter.events.flatMap((event) => {
      if (event.seq !== seq) return [event];
      return patch ? [{ ...event, ...patch }] : [];
    });

    expect(
      [
        ...new Set(
          judgeDeviceWitness({ events, steps: japaneseEnter.steps }).map(
            (violation) => violation.rule
          )
        ),
      ].sort()
    ).toEqual(rules);
  });

  test('rejects a Japanese composition end outside its Enter window', () => {
    const steps = japaneseEnter.steps.map((step) =>
      step.seqStart === 23 ? { ...step, seqEnd: 27 } : step
    );

    expect(
      judgeDeviceWitness({ events: japaneseEnter.events, steps }).map(
        (violation) => violation.rule
      )
    ).toEqual(['wrong-key', 'outside-window']);
  });

  test.each<[string, Fixture['events'], DeviceWitnessRule[]]>([
    [
      'missing Enter',
      mi6Enter.events.filter((event) => event.key !== 'Enter'),
      ['wrong-key', 'wrong-key'],
    ],
    [
      'untrusted Enter',
      mi6Enter.events.map((event) =>
        event.key === 'Enter' ? { ...event, isTrusted: false } : event
      ),
      ['wrong-key', 'wrong-key', 'untrusted'],
    ],
    [
      'Enter with the IME key code',
      mi6Enter.events.map((event) =>
        event.key === 'Enter' ? { ...event, keyCode: 229 } : event
      ),
      ['wrong-key', 'wrong-key'],
    ],
    [
      'Enter outside the gesture window',
      mi6Enter.events.map((event) =>
        event.key === 'Enter' ? { ...event, seq: 42 } : event
      ),
      ['wrong-key', 'wrong-key', 'outside-window'],
    ],
    [
      'a companion with another key code',
      mi6Enter.events.map((event) =>
        event.seq === 40 ? { ...event, keyCode: 13 } : event
      ),
      ['wrong-key'],
    ],
    [
      'a companion with another key',
      mi6Enter.events.map((event) =>
        event.seq === 40 ? { ...event, key: 'a' } : event
      ),
      ['wrong-key'],
    ],
    [
      'an untrusted companion',
      mi6Enter.events.map((event) =>
        event.seq === 40 ? { ...event, isTrusted: false } : event
      ),
      ['untrusted', 'wrong-key'],
    ],
  ])('rejects MI6 Enter companions with %s', (_name, events, rules) => {
    expect(
      judgeDeviceWitness({ events, steps: mi6Enter.steps }).map(
        (violation) => violation.rule
      )
    ).toEqual(rules);
  });

  test('rejects a script compositionend that carries new text', () => {
    const scriptEnd = korean.events.findIndex(
      (event) => event.type === 'compositionend' && !event.isTrusted
    );
    const events = korean.events.map((event, index) =>
      index === scriptEnd ? { ...event, data: 'z' } : event
    );

    expect(
      judgeDeviceWitness({ events, steps: korean.steps }).map(
        (violation) => violation.rule
      )
    ).toEqual(['untrusted']);
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
