import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import type { Page, TestInfo } from '@playwright/test';

import type { SlateBrowserEditorHarness } from './types';

const JPEG_SCREENSHOT_EXTENSION_RE = /\.(?:jpe?g)$/i;

/** Screenshot options accepted by Slate browser screenshot helpers. */
export type SlateBrowserPageScreenshotOptions = Omit<
  NonNullable<Parameters<Page['screenshot']>[0]>,
  'path'
>;

const getScreenshotContentType = (
  name: string,
  options: SlateBrowserPageScreenshotOptions
) => {
  const type =
    options.type ?? (JPEG_SCREENSHOT_EXTENSION_RE.test(name) ? 'jpeg' : 'png');

  return type === 'jpeg' ? 'image/jpeg' : 'image/png';
};

/**
 * Capture a Playwright page screenshot into the current test output directory
 * and attach it to the test report.
 */
export const attachPageScreenshot = async (
  page: Page,
  testInfo: TestInfo,
  name: string,
  options: SlateBrowserPageScreenshotOptions = {}
) => {
  const path = testInfo.outputPath(name);
  const contentType = getScreenshotContentType(name, options);

  await page.screenshot({ ...options, path });
  await testInfo.attach(name, { contentType, path });

  return path;
};

/**
 * Attach a focused editor selection screenshot to the current test report.
 */
export const attachSlateBrowserSelectionScreenshot = async (
  editor: SlateBrowserEditorHarness,
  testInfo: TestInfo,
  name: string,
  options: SlateBrowserPageScreenshotOptions = {}
) =>
  attachPageScreenshot(editor.page, testInfo, name, {
    fullPage: false,
    ...options,
  });

/**
 * Write a JSON proof artifact into the current test output directory and attach
 * that file to the test report.
 */
export const attachSlateBrowserJsonArtifact = async (
  testInfo: TestInfo,
  name: string,
  value: unknown
) => {
  const fileName = name.endsWith('.json') ? name : `${name}.json`;
  const path = testInfo.outputPath(fileName);

  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
  await testInfo.attach(name, { contentType: 'application/json', path });

  return path;
};
