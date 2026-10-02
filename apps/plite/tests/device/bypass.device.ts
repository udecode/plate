import { execFileSync } from 'node:child_process';

import {
  createDeviceLane,
  deviceLaneTest as test,
  expect,
} from '../../../../packages/test/src/device/lane';
import { judgeDeviceWitness } from '../../../../packages/test/src/device/witness';

const CDP_REPLAYS: Array<[string, Record<string, unknown>]> = [
  ['Input.insertText', { text: 'z' }],
  [
    'Input.imeSetComposition',
    { selectionEnd: 1, selectionStart: 1, text: 'z' },
  ],
  [
    'Input.dispatchKeyEvent',
    {
      key: 'Unidentified',
      text: 'z',
      type: 'keyDown',
      windowsVirtualKeyCode: 229,
    },
  ],
];

test('the guarded connection refuses every CDP input replay, and the witness judges adb replays', async ({
  deviceConnection,
}, testInfo) => {
  const lane = createDeviceLane(deviceConnection);
  const editor = await lane.openExample('plaintext');
  const [first] = await editor.get.modelBlockTexts();
  const cdp = await deviceConnection.page
    .context()
    .newCDPSession(deviceConnection.page);
  const send = cdp.send.bind(cdp) as (
    method: string,
    params: Record<string, unknown>
  ) => Promise<unknown>;
  const adb = (...args: string[]) =>
    execFileSync('adb', [
      '-s',
      deviceConnection.state.serial,
      'shell',
      ...args,
    ]);
  const insideTap = (replay: () => unknown) =>
    Promise.all([
      lane.keyboard.tap('h'),
      new Promise((resolve) => {
        setTimeout(() => resolve(replay()), 50);
      }),
    ]);

  await editor.touch.tap({ offset: first.length, path: [0, 0] });
  await lane.keyboard.use('en');

  for (const [method, params] of [
    ...CDP_REPLAYS,
    // Page script with its own DevTools binding would bypass the relay.
    [
      'Target.exposeDevToolsProtocol',
      { bindingName: 'cdp', targetId: deviceConnection.state.targetId },
    ] satisfies [string, Record<string, unknown>],
  ]) {
    await expect(send(method, params)).rejects.toThrow(/device lane refuses/);
    await insideTap(() =>
      expect(send(method, params)).rejects.toThrow(/device lane refuses/)
    );
  }
  await expect(deviceConnection.page.keyboard.type('x')).rejects.toThrow(
    /device lane refuses Input\.dispatchKeyEvent/
  );

  const settled = await lane.trace();
  const before = settled.at(-1)?.seq ?? 0;

  adb('input', 'text', 'x');
  adb('input', 'keyevent', 'KEYCODE_A');
  await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });

  const replayed = await lane.trace();
  const outside = judgeDeviceWitness({
    events: replayed.filter((entry) => entry.seq > before),
    steps: [],
  });

  expect(new Set(outside.map((violation) => violation.rule))).toEqual(
    new Set(['outside-window'])
  );

  const verdicts: string[] = [];

  for (const [name, replay] of [
    ['adb input text', () => adb('input', 'text', 'x')],
    ['adb input keyevent', () => adb('input', 'keyevent', 'KEYCODE_A')],
  ] as const) {
    const insideStart = lane.steps().length;

    await insideTap(replay);

    const steps = lane.steps().slice(insideStart);
    const trace = await lane.trace();
    const inside = trace.filter(
      (entry) => entry.seq >= (steps[0]?.seqStart ?? 0)
    );

    // The tap and the replay each reached the page.
    expect(inside.filter((entry) => entry.type === 'keydown')).toHaveLength(2);

    const rules = new Set(
      judgeDeviceWitness({
        events: trace.filter((entry) => entry.seq >= (steps[0]?.seqStart ?? 0)),
        steps,
      }).map((violation) => violation.rule)
    );

    // Gboard either turns an injected key into an Unidentified keydown, which
    // looks like the tap itself, or lets Chrome see the real key name.
    expect([[], ['wrong-key']]).toContainEqual([...rules]);
    verdicts.push(`${name}: ${rules.size === 0 ? 'equivalent' : 'wrong-key'}`);
  }

  const execStart = lane.steps().length;

  await insideTap(() =>
    deviceConnection.page.evaluate(() => {
      document.querySelector<HTMLElement>('[data-editor="true"]')?.focus();
      document.execCommand('insertText', false, 'z');
    })
  );

  const execSteps = lane.steps().slice(execStart);
  const execTrace = await lane.trace();

  // execCommand fires a trusted input event with no beforeinput.
  expect(
    judgeDeviceWitness({
      events: execTrace.filter(
        (entry) => entry.seq >= (execSteps[0]?.seqStart ?? 0)
      ),
      steps: execSteps,
    }).map((violation) => violation.rule)
  ).toEqual(['unpaired-input']);

  const description = `${verdicts.join('; ')}. An equivalent replay is the witness limit; the lane exposes no text input and the guard refuses CDP Input.*.`;

  process.stdout.write(`witness limit: ${description}\n`);
  testInfo.annotations.push({ description, type: 'witness-limit' });
});
