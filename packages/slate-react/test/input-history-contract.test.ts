import {
  getNativeTextInputHistoryMetadata,
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

test('native text input metadata merges rapid repair batches and pushes after idle', () => {
  const editor = {};
  const location = { path: [0, 0] };

  setNow(100);
  expect(getNativeTextInputHistoryMetadata(editor, location)).toEqual({
    origin: { kind: 'native-text-input' },
  });

  setNow(100 + NATIVE_TEXT_INPUT_HISTORY_MERGE_INTERVAL_MS - 1);
  expect(getNativeTextInputHistoryMetadata(editor, location)).toEqual({
    history: { mode: 'merge' },
    origin: { kind: 'native-text-input' },
  });

  setNow(100 + NATIVE_TEXT_INPUT_HISTORY_MERGE_INTERVAL_MS * 2);
  expect(getNativeTextInputHistoryMetadata(editor, location)).toEqual({
    history: { mode: 'push' },
    origin: { kind: 'native-text-input' },
  });
});

test('native text input metadata is scoped per editor instance', () => {
  const firstEditor = {};
  const secondEditor = {};
  const location = { path: [0, 0] };

  setNow(100);
  expect(getNativeTextInputHistoryMetadata(firstEditor, location)).toEqual({
    origin: { kind: 'native-text-input' },
  });

  setNow(110);
  expect(getNativeTextInputHistoryMetadata(secondEditor, location)).toEqual({
    origin: { kind: 'native-text-input' },
  });

  setNow(120);
  expect(getNativeTextInputHistoryMetadata(firstEditor, location)).toEqual({
    history: { mode: 'merge' },
    origin: { kind: 'native-text-input' },
  });
});

test('native text input metadata pushes when rapid input moves to another path', () => {
  const editor = {};

  setNow(100);
  expect(getNativeTextInputHistoryMetadata(editor, { path: [0, 0] })).toEqual({
    origin: { kind: 'native-text-input' },
  });

  setNow(110);
  expect(getNativeTextInputHistoryMetadata(editor, { path: [1, 0] })).toEqual({
    history: { mode: 'push' },
    origin: { kind: 'native-text-input' },
  });
});

test('native text input metadata pushes when rapid input moves to another root', () => {
  const editor = {};

  setNow(100);
  expect(
    getNativeTextInputHistoryMetadata(editor, {
      path: [0, 0],
      root: 'header',
    })
  ).toEqual({
    origin: { kind: 'native-text-input' },
  });

  setNow(110);
  expect(
    getNativeTextInputHistoryMetadata(editor, {
      path: [0, 0],
      root: 'footer',
    })
  ).toEqual({
    history: { mode: 'push' },
    origin: { kind: 'native-text-input' },
  });
});
