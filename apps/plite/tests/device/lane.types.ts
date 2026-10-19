import type { DeviceEditor, test } from '@platejs/test/device';
import type { TestType } from '@playwright/test';

type CaseArgs<T> =
  T extends TestType<infer Test, infer Worker> ? Test & Worker : never;

declare const args: CaseArgs<typeof test>;
declare const editor: DeviceEditor;

// @ts-expect-error A device case has no page; the phone takes real touches only.
await args.page.fill('body', 'text');
// @ts-expect-error A device editor exposes no locator to fill.
await editor.root.fill('text');
// @ts-expect-error The raw DevTools connection belongs to the lane, not a case.
await args.deviceConnection.page.evaluate(() => {});
// @ts-expect-error A case cannot open its own DevTools connection.
await args.playwright.chromium.connectOverCDP('http://127.0.0.1:9222');
// @ts-expect-error A case sends no requests of its own.
await args.request.get('/');
