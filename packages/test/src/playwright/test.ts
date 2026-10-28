import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { stripVTControlCharacters } from 'node:util';

import {
  test as base,
  type BrowserContext,
  type Frame,
  type PlaywrightTestArgs,
  type PlaywrightTestOptions,
  type PlaywrightWorkerArgs,
  type PlaywrightWorkerOptions,
  type TestInfo,
  type TestType,
} from '@playwright/test';

import { type FrameRead, readFrame, readOptions } from './read-frame';

const READ_DEADLINE_MS = 4000;
const WRITE_DEADLINE_MS = 1000;
const FILE_BYTES = 4 * 1024 * 1024;
const FILE_CUT_NOTES_BYTES = 16 * 1024;
const FILE_NAME = 'editor-state.json';
const ERRORS_KEPT = 20;
const ERROR_MAX_CHARS = 4000;
const URL_CHARS = 2000;
const NAME_CHARS = 200;
const TITLE_CHARS = 1000;
const HEAVY_FIELDS = [
  'value',
  'renderedBlocks',
  'lastCommit',
  'kernelTrace',
] as const;

type FrameField =
  | { state: 'read'; value: FrameRead }
  | {
      state: 'unread';
      reason: 'closed' | 'deadline' | 'over-budget' | 'threw';
      message?: string;
    };

const clip = (text: string, chars: number) =>
  text.length > chars
    ? `${text.slice(0, chars)}… (${text.length} characters)`
    : text;

const sizeOf = (value: unknown) => Buffer.byteLength(JSON.stringify(value));

const deadlineAfter = (ms: number) => {
  let passed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const done = new Promise<void>((resolve) => {
    timer = setTimeout(() => {
      passed = true;
      resolve();
    }, ms);
  });

  return { cancel: () => clearTimeout(timer), done, passed: () => passed };
};

const readFrameBefore = (
  frame: Frame,
  deadline: Promise<void>
): Promise<FrameField> =>
  Promise.race([
    frame.evaluate(readFrame, readOptions).then(
      (text): FrameField => ({
        state: 'read',
        value: JSON.parse(text) as FrameRead,
      }),
      (error: unknown): FrameField => ({
        state: 'unread',
        reason: frame.isDetached() ? 'closed' : 'threw',
        message: clip(String((error as Error)?.message ?? error), 500),
      })
    ),
    deadline.then((): FrameField => ({
      state: 'unread',
      reason: 'deadline',
      message: `not read within ${READ_DEADLINE_MS} ms`,
    })),
  ]);

const readBrowser = async (context: BrowserContext) => {
  const reading = deadlineAfter(READ_DEADLINE_MS);
  const owners = [
    context,
    ...(context.browser()?.contexts() ?? []).filter(
      (owner) => owner !== context
    ),
  ];
  const contexts = await Promise.all(
    owners.map(async (owner, contextIndex) => ({
      context: contextIndex,
      testContext: owner === context,
      pages: await Promise.all(
        owner.pages().map(async (page, pageIndex) => {
          const frames = page.frames();

          return {
            page: pageIndex,
            url: clip(page.url(), URL_CHARS),
            frames: await Promise.all(
              frames.map(async (frame, frameIndex) => {
                const parent = frame.parentFrame();

                return {
                  frame: frameIndex,
                  parent: parent ? frames.indexOf(parent) : null,
                  name: clip(frame.name(), NAME_CHARS) || null,
                  url: clip(frame.url(), URL_CHARS),
                  ...(await readFrameBefore(frame, reading.done)),
                };
              })
            ),
          };
        })
      ),
    }))
  );

  reading.cancel();

  return { complete: !reading.passed(), contexts };
};

type EditorState = {
  [field: string]: unknown;
  capture: { [field: string]: unknown; fileCuts: string[] };
  contexts: Awaited<ReturnType<typeof readBrowser>>['contexts'];
  omitted?: { contexts: number; frames: number; pages: number };
};

const serializeWithin = (state: EditorState) => {
  const limit = FILE_BYTES - FILE_CUT_NOTES_BYTES;
  const leftOut = `left out to keep ${FILE_NAME} under ${FILE_BYTES} bytes`;
  const own = state.contexts.filter((owner) => owner.testContext);
  const others = state.contexts.filter((owner) => !owner.testContext);
  const omitted = { contexts: 0, frames: 0, pages: 0 };
  const omit = (owners: EditorState['contexts']) => {
    for (const owner of owners) {
      omitted.contexts += 1;
      omitted.pages += owner.pages.length;

      for (const page of owner.pages) omitted.frames += page.frames.length;
    }
  };
  const slots = (owners: EditorState['contexts']) =>
    owners.flatMap((owner) =>
      owner.pages.flatMap((page) =>
        page.frames.map((_, index) => ({ frames: page.frames, index }))
      )
    );
  let bytes = sizeOf(state);
  const dropHeavyFields = (owners: EditorState['contexts'], where: string) => {
    let count = 0;

    for (const { frames, index } of slots(owners)) {
      const frame = frames[index];

      if (bytes <= limit) break;
      if (frame.state !== 'read') continue;

      const before = sizeOf(frame);

      for (const editor of frame.value.editors) {
        for (const name of HEAVY_FIELDS) {
          editor[name] = {
            state: 'unread',
            reason: 'over-budget',
            message: leftOut,
          };
        }
      }

      bytes += sizeOf(frame) - before;
      count += 1;
    }

    if (count > 0) {
      state.capture.fileCuts.push(
        `value, rendered blocks, last commit and kernel trace left out of ${count} frames in ${where}`
      );
    }
  };

  dropHeavyFields(others, 'other contexts');

  if (bytes > limit && others.length > 0) {
    omit(others);
    state.contexts = own;
    state.omitted = omitted;
    state.capture.fileCuts.push(`${others.length} other contexts left out`);
    bytes = sizeOf(state);
  }

  dropHeavyFields(own, "the test's own context");

  let shrunk = 0;

  for (const { frames, index } of slots(own)) {
    if (bytes <= limit) break;

    const { frame, name, parent, url } = frames[index];
    const address = {
      frame,
      parent,
      name,
      url,
      state: 'unread' as const,
      reason: 'over-budget' as const,
      message: leftOut,
    };

    bytes += sizeOf(address) - sizeOf(frames[index]);
    frames[index] = address;
    shrunk += 1;
  }

  if (shrunk > 0) {
    state.capture.fileCuts.push(
      `${shrunk} frames in the test's own context shrunk to their address`
    );
  }
  if (bytes > limit) {
    const kept = new Set<unknown>();
    let room =
      limit -
      sizeOf({
        ...state,
        contexts: own.map((owner) => ({
          ...owner,
          pages: owner.pages.map((page) => ({ ...page, frames: [] })),
        })),
      });

    for (const { frames, index } of slots(own)) {
      const size = sizeOf(frames[index]) + 1;

      if (size > room) break;

      kept.add(frames[index]);
      room -= size;
    }

    let left = 0;

    for (const owner of own) {
      for (const page of owner.pages) {
        left += page.frames.length;
        page.frames = page.frames.filter((frame) => kept.has(frame));
        left -= page.frames.length;
      }
    }

    if (left > 0) {
      omitted.frames += left;
      state.omitted = omitted;
      state.capture.fileCuts.push(`${left} frames left out entirely`);
    }
  }

  const text = JSON.stringify(state);

  if (Buffer.byteLength(text) <= FILE_BYTES) return text;

  omit(own);
  state.contexts = [];
  state.omitted = omitted;
  state.capture.fileCuts.push('every context left out');

  return JSON.stringify(state);
};

const warn = (message: string) => {
  process.stderr.write(`${message}\n`);
};
const notSaved = (error: unknown) =>
  warn(
    `${FILE_NAME} was not saved: ${String((error as Error)?.message ?? error)}`
  );

const saveWithin = async (text: string, testInfo: TestInfo) => {
  const path = join(testInfo.outputDir, FILE_NAME);
  const partial = `${path}.partial`;
  const writing = deadlineAfter(WRITE_DEADLINE_MS);
  const write = async () => {
    await mkdir(testInfo.outputDir, { recursive: true });
    await writeFile(partial, text);

    if (writing.passed()) {
      await rm(partial, { force: true });

      return;
    }

    await rename(partial, path);

    if (writing.passed()) {
      await rm(path, { force: true });

      return;
    }

    testInfo.attachments.push({
      name: 'editor-state',
      contentType: 'application/json',
      path,
    });
  };
  const late = await Promise.race([
    write().then(
      () => false,
      (error: unknown) => {
        notSaved(error);

        return false;
      }
    ),
    writing.done.then(() => true),
  ]);

  writing.cancel();

  if (late) {
    warn(
      `${FILE_NAME} was not saved in time: writing it took longer than ${WRITE_DEADLINE_MS} ms, so it is not attached to the report. A copy that still lands in the test's output folder holds the whole capture`
    );
  }
};

const saveEditorState = async (context: BrowserContext, testInfo: TestInfo) => {
  const started = Date.now();
  const errors = testInfo.errors.map((error) =>
    clip(
      stripVTControlCharacters(error.message ?? error.value ?? ''),
      ERROR_MAX_CHARS
    )
  );
  const timeoutRecorded = testInfo.status === 'timedOut';
  const { complete, contexts } = await readBrowser(context);
  const text = serializeWithin({
    version: 1,
    test: {
      expectedStatus: testInfo.expectedStatus,
      file: testInfo.file,
      line: testInfo.line,
      project: clip(testInfo.project.name, NAME_CHARS),
      retry: testInfo.retry,
      status: testInfo.status,
      title: clip(testInfo.titlePath.slice(1).join(' > '), TITLE_CHARS),
    },
    errors: errors.slice(0, ERRORS_KEPT),
    ...(errors.length > ERRORS_KEPT && {
      omittedErrors: errors.length - ERRORS_KEPT,
    }),
    capture: {
      readAfter:
        'the test body, its afterEach hooks and the teardown of every fixture torn down before this capture',
      timeoutRecorded,
      ...(timeoutRecorded && {
        note: 'A timeout was recorded, so the page may have kept changing while it was read.',
      }),
      complete,
      milliseconds: Date.now() - started,
      fileCuts: [],
    },
    contexts,
  });

  await saveWithin(text, testInfo);
};

/**
 * Playwright's `test` for editor specs. When a test fails or times out and
 * `test.fail()` did not expect that outcome, its output folder also holds
 * `editor-state.json`: every editor on every page and frame of every context
 * of the test's browser, read after the test's afterEach hooks and before
 * Playwright closes its context.
 */
export const test: TestType<
  PlaywrightTestArgs & PlaywrightTestOptions,
  PlaywrightWorkerArgs & PlaywrightWorkerOptions
> = base.extend<{ _editorState: void }>({
  _editorState: [
    async ({ context }, use, testInfo) => {
      await use();

      if (
        testInfo.status !== testInfo.expectedStatus &&
        (testInfo.status === 'failed' || testInfo.status === 'timedOut')
      ) {
        await saveEditorState(context, testInfo).catch(notSaved);
      }
    },
    // Its own time, so a slow capture never spends the time Playwright gives
    // the test's other teardown, and that teardown never cuts the capture short.
    {
      auto: true,
      box: true,
      timeout: 2 * (READ_DEADLINE_MS + WRITE_DEADLINE_MS),
    },
  ],
});

/** Playwright's `expect`, exported beside `test` so a spec imports both from here. */
export { expect } from '@playwright/test';
