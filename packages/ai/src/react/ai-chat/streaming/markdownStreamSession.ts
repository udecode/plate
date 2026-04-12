import type { Path, SlateEditor } from 'platejs';

export type StreamInsertRuntimeState = {
  replayStartOffset: number;
  source: string;
  stableBlockCount: number;
  startPath: Path;
};

type MarkdownStreamSessionState = {
  currentPath: Path | null;
  mdxName: string | null;
  runtimeState?: StreamInsertRuntimeState;
  source: string;
};

const markdownStreamSessions = new WeakMap<
  SlateEditor,
  MarkdownStreamSessionState
>();

const getOrCreateMarkdownStreamSession = (editor: SlateEditor) => {
  const existing = markdownStreamSessions.get(editor);

  if (existing) return existing;

  const state: MarkdownStreamSessionState = {
    currentPath: null,
    mdxName: null,
    source: '',
  };

  markdownStreamSessions.set(editor, state);

  return state;
};

export const appendMarkdownStreamSource = (
  editor: SlateEditor,
  chunk: string
) => {
  const state = getOrCreateMarkdownStreamSession(editor);

  state.source += chunk;

  return state.source;
};

export const clearMarkdownStreamSession = (editor: SlateEditor) => {
  markdownStreamSessions.delete(editor);
};

export const getMarkdownStreamCurrentPath = (editor: SlateEditor) =>
  markdownStreamSessions.get(editor)?.currentPath ?? null;

export const getMarkdownStreamMdxName = (editor: SlateEditor) =>
  markdownStreamSessions.get(editor)?.mdxName ?? null;

export const getMarkdownStreamRuntimeState = (editor: SlateEditor) =>
  markdownStreamSessions.get(editor)?.runtimeState;

export const getMarkdownStreamSource = (editor: SlateEditor) =>
  markdownStreamSessions.get(editor)?.source ?? '';

export const setMarkdownStreamCurrentPath = (
  editor: SlateEditor,
  path: Path | null
) => {
  getOrCreateMarkdownStreamSession(editor).currentPath = path;
};

export const setMarkdownStreamMdxName = (
  editor: SlateEditor,
  mdxName: string | null
) => {
  getOrCreateMarkdownStreamSession(editor).mdxName = mdxName;
};

export const setMarkdownStreamRuntimeState = (
  editor: SlateEditor,
  runtimeState: StreamInsertRuntimeState | undefined
) => {
  const state = getOrCreateMarkdownStreamSession(editor);

  state.runtimeState = runtimeState;
};

export const setMarkdownStreamSource = (
  editor: SlateEditor,
  source: string
) => {
  getOrCreateMarkdownStreamSession(editor).source = source;
};
