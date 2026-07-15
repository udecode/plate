import {
  getNativeTextInputUpdateTags,
  NATIVE_TEXT_INPUT_HISTORY_MERGE_INTERVAL_MS,
} from '../src/editable/input-history';

const originalPerformance = globalThis.performance;

const setNow = (value: number) => {
  Object.defineProperty(globalThis, 'performance', {
    configurable: true,
    value: { now: () => value },
  });
};

afterEach(() => {
  Object.defineProperty(globalThis, 'performance', {
    configurable: true,
    value: originalPerformance,
  });
});

test('native text input tags merge rapid repair batches and push after idle', () => {
  const editor = {};
  const location = { path: [0, 0] };

  setNow(100);
  expect(getNativeTextInputUpdateTags(editor, location)).toEqual([
    'native-text-input',
  ]);

  setNow(100 + NATIVE_TEXT_INPUT_HISTORY_MERGE_INTERVAL_MS - 1);
  expect(getNativeTextInputUpdateTags(editor, location)).toEqual([
    'native-text-input',
    'history-merge',
  ]);

  setNow(100 + NATIVE_TEXT_INPUT_HISTORY_MERGE_INTERVAL_MS * 2);
  expect(getNativeTextInputUpdateTags(editor, location)).toEqual([
    'native-text-input',
    'history-push',
  ]);
});

test('native text input tags are scoped per editor instance', () => {
  const firstEditor = {};
  const secondEditor = {};
  const location = { path: [0, 0] };

  setNow(100);
  expect(getNativeTextInputUpdateTags(firstEditor, location)).toEqual([
    'native-text-input',
  ]);

  setNow(110);
  expect(getNativeTextInputUpdateTags(secondEditor, location)).toEqual([
    'native-text-input',
  ]);

  setNow(120);
  expect(getNativeTextInputUpdateTags(firstEditor, location)).toEqual([
    'native-text-input',
    'history-merge',
  ]);
});

test('native text input tags push when rapid input moves to another path', () => {
  const editor = {};

  setNow(100);
  expect(getNativeTextInputUpdateTags(editor, { path: [0, 0] })).toEqual([
    'native-text-input',
  ]);

  setNow(110);
  expect(getNativeTextInputUpdateTags(editor, { path: [1, 0] })).toEqual([
    'native-text-input',
    'history-push',
  ]);
});

test('native text input tags push when rapid input moves to another root', () => {
  const editor = {};

  setNow(100);
  expect(
    getNativeTextInputUpdateTags(editor, {
      path: [0, 0],
      root: 'header',
    })
  ).toEqual(['native-text-input']);

  setNow(110);
  expect(
    getNativeTextInputUpdateTags(editor, {
      path: [0, 0],
      root: 'footer',
    })
  ).toEqual(['native-text-input', 'history-push']);
});
