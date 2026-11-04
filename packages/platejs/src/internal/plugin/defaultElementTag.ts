/**
 * `EditorElement` keeps its documented `div` default for the components that
 * render it, so the renderers pick an inline element's `span` here.
 */
export const getDefaultElementTag = (attributes: {
  'data-editor-inline'?: unknown;
}): 'div' | 'span' => (attributes['data-editor-inline'] ? 'span' : 'div');
