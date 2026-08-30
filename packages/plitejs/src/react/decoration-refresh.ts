import type { PliteDecorationSource } from './decoration-source';
import type { PliteProjectionStoreRefreshOptions } from './projection-store';

const EDITOR_TO_DECORATION_REFRESH_SOURCES = new WeakMap<
  object,
  Set<Pick<PliteDecorationSource, 'refresh'>>
>();

export const registerEditorDecorationRefreshSource = (
  editor: object,
  source: Pick<PliteDecorationSource, 'refresh'>
) => {
  let sources = EDITOR_TO_DECORATION_REFRESH_SOURCES.get(editor);

  if (!sources) {
    sources = new Set();
    EDITOR_TO_DECORATION_REFRESH_SOURCES.set(editor, sources);
  }

  sources.add(source);

  return () => {
    sources.delete(source);

    if (sources.size === 0) {
      EDITOR_TO_DECORATION_REFRESH_SOURCES.delete(editor);
    }
  };
};

export const refreshEditorDecorations = (
  editor: object,
  options?: PliteProjectionStoreRefreshOptions
) => {
  const sources = EDITOR_TO_DECORATION_REFRESH_SOURCES.get(editor);

  if (!sources) {
    return;
  }

  Array.from(sources).forEach((source) => {
    source.refresh(options);
  });
};
