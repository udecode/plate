import {
  deserializeAuthoredJson,
  readAuthoredFormatSnapshot,
  type AuthoredFormatDiagnostic,
} from '../authored';
import {
  createEditorView,
  type Descendant,
  type EditorDocumentValue,
  type RuntimeAnyEditor,
} from '../facade';
import type { Editor } from '../lib';
import {
  renderStaticHtml,
  type RenderStaticHtmlOptions,
} from './renderStaticHtml';

const AUTHORED_HTML_ENVELOPE =
  /<script type="application\/vnd\.editor\.authored\+json" data-editor-authored="v1">([\s\S]*?)<\/script>\s*$/;

export type AuthoredHtmlResult = Readonly<{
  data: string;
  diagnostics: readonly AuthoredFormatDiagnostic[];
}>;

export type RenderAuthoredHtmlOptions = RenderStaticHtmlOptions & {
  projection: 'accepted' | 'proposed' | 'review';
};

type HtmlDeserializeEditor = Editor & {
  api: Editor['api'] & {
    html: {
      deserialize: (options: {
        collapseWhiteSpace?: boolean;
        element: HTMLElement | string;
      }) => Descendant[] | null;
    };
  };
};

type AuthoredViewSource = Editor & {
  read: Editor['read'] & { authored: unknown };
};

const safeJsonForHtml = (value: unknown) =>
  JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');

const projectionDiagnostics = (
  projection: 'accepted' | 'proposed',
  count: number
): readonly AuthoredFormatDiagnostic[] =>
  count === 0
    ? []
    : [
        Object.freeze({
          code: 'authored-lossy-projection' as const,
          message: `${projection} projection omits ${count} pending authored change${count === 1 ? '' : 's'}.`,
          severity: 'warning' as const,
        }),
      ];

/** Render one explicit authored projection. Review output embeds the canonical envelope. */
export const renderAuthoredHtml = async (
  editor: RuntimeAnyEditor,
  { projection, ...options }: RenderAuthoredHtmlOptions
): Promise<AuthoredHtmlResult> => {
  const snapshot = readAuthoredFormatSnapshot(editor as never);
  const view = createEditorView(editor as AuthoredViewSource, {
    authored:
      projection === 'accepted'
        ? { intent: 'edit', projection: 'accepted' }
        : { intent: 'propose', projection: 'proposed' },
  }) as unknown as Editor;
  const html = await renderStaticHtml(view, options);

  if (projection === 'review') {
    return Object.freeze({
      data: `${html}<script type="application/vnd.editor.authored+json" data-editor-authored="v1">${safeJsonForHtml(editor.read.value())}</script>`,
      diagnostics: Object.freeze([]),
    });
  }

  return Object.freeze({
    data: html,
    diagnostics: Object.freeze(
      projectionDiagnostics(projection, snapshot.changes.length)
    ),
  });
};

/** Deserialize authored HTML to a detached canonical document envelope. */
export const deserializeAuthoredHtml = (
  editor: HtmlDeserializeEditor,
  data: string
): EditorDocumentValue => {
  const envelope = AUTHORED_HTML_ENVELOPE.exec(data)?.[1];

  if (envelope !== undefined) {
    try {
      return deserializeAuthoredJson(envelope);
    } catch (error) {
      throw new Error('Invalid authored HTML envelope.', { cause: error });
    }
  }
  const children = editor.api.html.deserialize({ element: data });

  if (!children) throw new Error('Failed to decode HTML.');

  return { children };
};
