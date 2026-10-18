'use client';

import { DownloadIcon } from 'lucide-react';
import { NodeApi } from 'platejs';
import { useEditor, useEditorSelector, usePath } from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
  CodeBlockAddon,
  CodeBlockComponent,
  CodeBlockElementProps,
} from '@/registry/components/editor/code-block';

export type DiagramRenderer = Readonly<{
  /** Fence languages this engine draws, canonical first, such as ['graphviz', 'dot']. */
  languages: readonly [string, ...string[]];
  label: string;
  /**
   * Resolves SVG markup, or rejects with a message the block shows. Once
   * `signal` aborts, the block drops the result, so a renderer may stop early
   * but does not have to.
   */
  render: (source: string, options: { signal: AbortSignal }) => Promise<string>;
}>;

type DiagramView = 'both' | 'code';

const diagramViews: ReadonlyArray<{ label: string; value: DiagramView }> = [
  { label: 'Code', value: 'code' },
  { label: 'Both', value: 'both' },
];

type DiagramPicture = Readonly<{ error: string | null; url: string | null }>;

const emptyPicture: DiagramPicture = { error: null, url: null };

/** Draw the code blocks whose language one of `renderers` claims. */
export function withDiagrams(
  Element: CodeBlockComponent,
  { renderers }: { renderers: readonly DiagramRenderer[] }
): CodeBlockComponent {
  const rendererByLanguage = new Map<string, DiagramRenderer>();

  for (const renderer of renderers) {
    for (const language of renderer.languages) {
      if (rendererByLanguage.has(language)) {
        throw new Error(`Two diagram renderers claim "${language}".`);
      }

      rendererByLanguage.set(language, renderer);
    }
  }

  const languageOptions = renderers.map((renderer) => ({
    label: renderer.label,
    value: renderer.languages[0],
  }));

  return function DiagramCodeBlockElement(props: CodeBlockElementProps) {
    const renderer = rendererByLanguage.get(props.element.language ?? '');
    const outerOptions = props.addon?.languageOptions;
    const addon = {
      ...props.addon,
      languageOptions: outerOptions
        ? [...outerOptions, ...languageOptions]
        : languageOptions,
    };

    if (!renderer) return <Element {...props} addon={addon} />;

    return (
      <DiagramCodeBlock
        addon={addon}
        Element={Element}
        elementProps={props}
        renderer={renderer}
      />
    );
  };
}

function DiagramCodeBlock({
  addon,
  Element,
  elementProps,
  renderer,
}: {
  addon: CodeBlockAddon;
  Element: CodeBlockComponent;
  elementProps: CodeBlockElementProps;
  renderer: DiagramRenderer;
}) {
  const { element } = elementProps;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [view, setView] = React.useState<DiagramView>('both');
  const nearViewport = useNearViewport(containerRef);
  const source = useLiveSource(element);
  const picture = useDiagramPicture(
    renderer,
    source,
    view === 'both' && nearViewport
  );

  return (
    <Element
      {...elementProps}
      addon={{
        ...addon,
        toolbar: (
          <>
            {addon.toolbar}
            <DiagramViewToggle view={view} onPick={setView} />
            {picture.url && <DiagramExportButton url={picture.url} />}
          </>
        ),
        wrapSource: (body) => (
          <div ref={containerRef}>
            {addon.wrapSource ? addon.wrapSource(body) : body}
            {/* The editor restores child nodes added or removed beside the
                source, so the picture area stays mounted and only hides. */}
            <div
              className="border-t border-border/60 px-8 py-4"
              contentEditable={false}
              hidden={view === 'code'}
            >
              {view === 'both' &&
                picture.url && (
                  // oxlint-disable-next-line nextjs/no-img-element -- [P1 local-invariant] toDataUrl turns every rendered SVG into a data URL; optimization and remote loading do not apply.
                  <img
                    alt={element.language ?? renderer.label}
                    className="mx-auto max-h-96 max-w-full"
                    draggable={false}
                    src={picture.url}
                  />
                )}
              {view === 'both' && (
                <DiagramStatus
                  empty={source.trim().length === 0}
                  error={picture.error}
                  loading={!picture.url && !picture.error}
                />
              )}
            </div>
          </div>
        ),
      }}
    />
  );
}

function DiagramViewToggle({
  onPick,
  view,
}: {
  view: DiagramView;
  onPick: (view: DiagramView) => void;
}) {
  return (
    <div className="flex items-center rounded-md" role="group">
      {diagramViews.map((option) => (
        <Button
          key={option.value}
          size="sm"
          variant="ghost"
          className={cn(
            'h-6 px-2 text-xs text-muted-foreground',
            view === option.value && 'bg-accent text-accent-foreground'
          )}
          aria-pressed={view === option.value}
          onClick={() => onPick(option.value)}
          onMouseDown={(event) => event.preventDefault()}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

function DiagramExportButton({ url }: { url: string }) {
  return (
    <Button
      size="icon"
      variant="ghost"
      className="size-6 text-muted-foreground"
      onClick={(event) => {
        const { ownerDocument } = event.currentTarget;
        const image = ownerDocument.createElement('img');

        image.addEventListener(
          'load',
          () => {
            const { naturalHeight, naturalWidth } = image;
            // A canvas past the browser's size limit exports as `data:,`. These
            // bounds sit within every engine's, iOS Safari's 16,777,216 px included.
            const scale = Math.min(
              1,
              16_384 / Math.max(naturalWidth, naturalHeight),
              Math.sqrt(16_777_216 / (naturalWidth * naturalHeight))
            );
            const canvas = ownerDocument.createElement('canvas');
            canvas.width = Math.max(1, Math.floor(naturalWidth * scale));
            canvas.height = Math.max(1, Math.floor(naturalHeight * scale));
            canvas
              .getContext('2d')
              ?.drawImage(image, 0, 0, canvas.width, canvas.height);

            const link = ownerDocument.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'diagram.png';
            link.click();
          },
          { once: true }
        );
        image.src = url;
      }}
      onMouseDown={(event) => event.preventDefault()}
      title="Export PNG"
    >
      <DownloadIcon className="!size-3.5" />
    </Button>
  );
}

function DiagramStatus({
  empty,
  error,
  loading,
}: {
  empty: boolean;
  error: string | null;
  loading: boolean;
}) {
  if (empty) {
    return (
      <span className="block text-sm text-muted-foreground">Empty diagram</span>
    );
  }
  if (error) {
    return (
      <span className="block text-sm whitespace-pre-wrap text-destructive">
        {error}
      </span>
    );
  }
  if (loading) {
    return (
      <span className="block text-sm text-muted-foreground">Drawing…</span>
    );
  }

  return null;
}

function useLiveSource(element: CodeBlockElementProps['element']) {
  const editor = useEditor();
  const path = usePath();
  const nodeKey = editor.read((state) => state.key(path));

  return useEditorSelector(
    (current) => NodeApi.string(current.read.nodes.get(path)?.[0] ?? element),
    {
      shouldUpdate: (change) =>
        !change || !nodeKey || change.changed.hasNodeKey(nodeKey, 'node'),
    }
  );
}

function useNearViewport(ref: React.RefObject<HTMLElement | null>) {
  const [near, setNear] = React.useState(
    () => typeof IntersectionObserver === 'undefined'
  );

  React.useEffect(() => {
    const node = ref.current;

    if (!node || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => setNear(entries.at(-1)?.isIntersecting ?? false),
      { rootMargin: '200px 0px' }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [ref]);

  return near;
}

const scheduleIdle = (callback: () => void) => {
  if (typeof requestIdleCallback === 'function') {
    const id = requestIdleCallback(callback);

    return () => cancelIdleCallback(id);
  }

  const id = setTimeout(callback, 0);

  return () => clearTimeout(id);
};

const toDataUrl = (svg: string) => {
  const root = new DOMParser().parseFromString(
    svg,
    'image/svg+xml'
  ).documentElement;

  if (root.localName !== 'svg') {
    throw new Error('The renderer did not return an SVG picture.');
  }

  let binary = '';

  for (const byte of new TextEncoder().encode(svg)) {
    binary += String.fromCharCode(byte);
  }

  return `data:image/svg+xml;base64,${btoa(binary)}`;
};

function useDiagramPicture(
  renderer: DiagramRenderer,
  source: string,
  enabled: boolean
): DiagramPicture {
  const [picture, setPicture] = React.useState<
    DiagramPicture & { drawnBy: DiagramRenderer | null }
  >({ ...emptyPicture, drawnBy: null });
  const singleFlight = React.useRef<{
    enabled: boolean;
    next: string | null;
    renderer: DiagramRenderer;
    requested: string | null;
    unsettled: AbortController | null;
  }>({ enabled, next: null, renderer, requested: null, unsettled: null });
  const empty = source.trim().length === 0;

  React.useEffect(() => {
    const { current } = singleFlight;

    return () => {
      if (current.unsettled) {
        current.unsettled.abort();
        current.requested = null;
      }
      current.next = null;
    };
  }, []);

  React.useEffect(() => {
    const { current } = singleFlight;

    const drain = () => {
      const { next, renderer: drawing } = current;

      if (current.unsettled || !current.enabled || next === null) return;

      const controller = new AbortController();

      current.next = null;
      current.requested = next;
      current.unsettled = controller;
      drawing
        .render(next, { signal: controller.signal })
        .then(toDataUrl)
        .then(
          (url) => {
            if (!controller.signal.aborted) {
              setPicture({ drawnBy: drawing, error: null, url });
            }
          },
          (error: unknown) => {
            if (!controller.signal.aborted) {
              setPicture((previous) => ({
                drawnBy: drawing,
                error: error instanceof Error ? error.message : String(error),
                url: previous.drawnBy === drawing ? previous.url : null,
              }));
            }
          }
        )
        .finally(() => {
          current.unsettled = null;
          scheduleIdle(drain);
        });
    };

    current.enabled = enabled;
    if (current.renderer !== renderer || empty) {
      current.unsettled?.abort();
      current.renderer = renderer;
      current.requested = null;
    }
    current.next =
      enabled && !empty && source !== current.requested ? source : null;

    return current.next === null ? undefined : scheduleIdle(drain);
  }, [empty, enabled, renderer, source]);

  return empty || picture.drawnBy !== renderer ? emptyPicture : picture;
}
