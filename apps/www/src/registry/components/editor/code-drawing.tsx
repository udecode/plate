'use client';

import { DownloadIcon, Trash2 } from 'lucide-react';
import {
  type CodeDrawingLanguage,
  type CodeDrawingView,
  CODE_DRAWING_LANGUAGES,
  DEFAULT_MIN_HEIGHT,
  DOWNLOAD_FILENAME,
  RENDER_DEBOUNCE_DELAY,
  CODE_DRAWING_VIEWS,
  downloadImage,
  renderCodeDrawing,
} from 'platejs/code-drawing';
import { CodeDrawingPlugin } from 'platejs/code-drawing/react';
import {
  type PlateElementProps,
  PlateElement,
  useEditor,
  useEditorReadOnly,
  useEditorSelector,
  useElement,
  useElementSelected,
  useFocusedLast,
  usePath,
} from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  FloatingPopover,
  FloatingPopoverAnchor,
  FloatingPopoverContent,
} from '@/registry/components/editor/floating-popover';

const languageLabels: Record<CodeDrawingLanguage, string> = {
  flowchart: 'Flowchart',
  graphviz: 'Graphviz',
  mermaid: 'Mermaid',
  plantuml: 'PlantUML',
};

const viewLabels: Record<CodeDrawingView, string> = {
  code: 'Code',
  preview: 'Preview',
  split: 'Split',
};

const isCodeDrawingLanguage = (
  value: string | null
): value is CodeDrawingLanguage =>
  CODE_DRAWING_LANGUAGES.some((language) => language === value);

const isCodeDrawingView = (value: string | null): value is CodeDrawingView =>
  CODE_DRAWING_VIEWS.some((view) => view === value);

export function CodeDrawingElement(
  props: PlateElementProps<typeof CodeDrawingPlugin>
) {
  const { children } = props;
  const isMobile = useIsMobile();
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const selected = useElementSelected();
  const isFocusedLast = useFocusedLast();
  const element = useElement(CodeDrawingPlugin);
  const path = usePath();
  const [loading, setLoading] = React.useState(false);
  const [image, setImage] = React.useState('');
  const [renderError, setRenderError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const render = async () => {
      if (!element.code.trim()) {
        setImage('');
        setRenderError(null);
        setLoading(false);
        return;
      }

      setRenderError(null);
      setLoading(true);

      try {
        const imageData = await renderCodeDrawing(
          element.language,
          element.code
        );

        if (!cancelled) setImage(imageData);
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : 'Rendering failed';

          console.error(message);
          setImage('');
          setRenderError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const timeout = window.setTimeout(() => {
      void render();
    }, RENDER_DEBOUNCE_DELAY);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [element.code, element.language]);

  const handleDownload = React.useCallback(() => {
    if (!image) return;
    downloadImage(image, DOWNLOAD_FILENAME);
  }, [image]);

  const handleCodeChange = React.useCallback(
    (code: string) => {
      if (path) {
        editor.update.nodes.set({ code }, { at: path });
      }
    },
    [editor, path]
  );

  const handleLanguageChange = React.useCallback(
    (language: CodeDrawingLanguage) => {
      if (path) {
        editor.update.nodes.set({ language }, { at: path });
      }
    },
    [editor, path]
  );

  const handleViewChange = React.useCallback(
    (view: CodeDrawingView) => {
      if (path) {
        editor.update.nodes.set({ view }, { at: path });
      }
    },
    [editor, path]
  );

  const { code, language, view } = element;

  const selectionCollapsed = useEditorSelector((innerEditor) =>
    innerEditor.read.selection.isCollapsed()
  );

  const open = isFocusedLast && !readOnly && selected && selectionCollapsed;

  const content = (
    <PlateElement {...props}>
      <div contentEditable={false}>
        <div>
          <CodeDrawingPreview
            code={code}
            language={language}
            view={view}
            image={image}
            loading={loading}
            renderError={renderError}
            onCodeChange={handleCodeChange}
            onLanguageChange={handleLanguageChange}
            onViewChange={handleViewChange}
            readOnly={readOnly}
            isMobile={isMobile}
          />
        </div>
      </div>
      {children}
    </PlateElement>
  );

  if (readOnly) {
    return content;
  }

  return (
    <FloatingPopover open={open} modal={false}>
      <FloatingPopoverAnchor element={content} />
      <FloatingPopoverContent
        className="w-auto p-1"
        contentEditable={false}
        onInitialFocus={(e) => {
          e.preventDefault();
        }}
      >
        <div className="flex items-center gap-1">
          {image && (
            <Button
              size="icon"
              variant="ghost"
              className="size-8"
              onClick={handleDownload}
              title="Export"
            >
              <DownloadIcon className="size-4" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={() => {
              if (!readOnly && path) editor.update.nodes.remove({ at: path });
            }}
            title="Delete"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </FloatingPopoverContent>
    </FloatingPopover>
  );
}

function CodeDrawingPreview({
  code,
  language,
  view,
  image,
  loading,
  renderError,
  onCodeChange,
  onLanguageChange,
  onViewChange,
  readOnly = false,
  isMobile = false,
}: {
  code: string;
  language: CodeDrawingLanguage;
  view: CodeDrawingView;
  image: string;
  loading: boolean;
  renderError: string | null;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: CodeDrawingLanguage) => void;
  onViewChange: (view: CodeDrawingView) => void;
  readOnly?: boolean;
  isMobile?: boolean;
}) {
  const viewMode = view;
  const showCode = viewMode === 'split' || viewMode === 'code';
  const showBorder = viewMode === 'split';

  const handleCodeChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onCodeChange(e.target.value);
    },
    [onCodeChange]
  );

  const toolbar = readOnly ? null : (
    <CodeDrawingToolbar
      language={language}
      viewMode={viewMode}
      readOnly={readOnly}
      isMobile={isMobile}
      onLanguageChange={onLanguageChange}
      onViewChange={onViewChange}
    />
  );

  return (
    <div
      className={`flex ${
        isMobile ? 'flex-col-reverse' : 'flex-col'
      } group my-4 w-full items-stretch border bg-muted/50 md:flex-row`}
      style={{
        minHeight: `${DEFAULT_MIN_HEIGHT}px`,
      }}
    >
      {showCode && (
        <CodeDrawingTextarea
          code={code}
          viewMode={viewMode}
          readOnly={readOnly}
          isMobile={isMobile}
          showBorder={showBorder}
          onCodeChange={handleCodeChange}
          toolbar={viewMode === 'code' ? toolbar : null}
        />
      )}

      {viewMode !== 'code' && (
        <CodeDrawingPreviewArea
          image={image}
          loading={loading}
          renderError={renderError}
          code={code}
          viewMode={viewMode}
          readOnly={readOnly}
          isMobile={isMobile}
          showBorder={showBorder}
          toolbar={toolbar}
        />
      )}
    </div>
  );
}

function CodeDrawingToolbar({
  language,
  viewMode,
  readOnly = false,
  isMobile = false,
  onLanguageChange,
  onViewChange,
}: {
  language: CodeDrawingLanguage;
  viewMode: CodeDrawingView;
  readOnly?: boolean;
  isMobile?: boolean;
  onLanguageChange: (language: CodeDrawingLanguage) => void;
  onViewChange: (view: CodeDrawingView) => void;
}) {
  const [toolbarVisible, setToolbarVisible] = React.useState(false);
  const [languageSelectOpen, setLanguageSelectOpen] = React.useState(false);
  const [viewSelectOpen, setViewSelectOpen] = React.useState(false);

  const opacityClass =
    isMobile || toolbarVisible || languageSelectOpen || viewSelectOpen
      ? 'opacity-100'
      : 'opacity-0 group-hover:opacity-100';

  const positionClass = isMobile
    ? 'flex items-center gap-2'
    : 'absolute right-2 z-10 flex items-center gap-2';

  return (
    <div
      role="toolbar"
      tabIndex={-1}
      className={`${positionClass} transition-opacity ${opacityClass}`}
      onMouseEnter={() => {
        setToolbarVisible(true);
      }}
      onMouseLeave={() => {
        if (!languageSelectOpen && !viewSelectOpen) {
          setToolbarVisible(false);
        }
      }}
    >
      {!readOnly && (
        <Select
          value={language}
          onValueChange={(nextLanguage) => {
            if (isCodeDrawingLanguage(nextLanguage)) {
              onLanguageChange(nextLanguage);
            }
          }}
          open={languageSelectOpen}
          onOpenChange={setLanguageSelectOpen}
        >
          <SelectTrigger
            className={`h-8 w-[120px] border-0 bg-muted/50 text-xs shadow-none ${
              isMobile ? '' : 'transition-colors hover:bg-zinc-200'
            }`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[100]">
            {CODE_DRAWING_LANGUAGES.map((innerLanguage) => (
              <SelectItem key={innerLanguage} value={innerLanguage}>
                {languageLabels[innerLanguage]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {!readOnly && (
        <Select
          value={viewMode}
          onValueChange={(nextView) => {
            if (isCodeDrawingView(nextView)) {
              onViewChange(nextView);
            }
          }}
          open={viewSelectOpen}
          onOpenChange={setViewSelectOpen}
        >
          <SelectTrigger
            className={`h-8 w-[80px] border-0 bg-muted/50 text-xs shadow-none ${
              isMobile ? '' : 'transition-colors hover:bg-zinc-200'
            }`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[100]">
            {CODE_DRAWING_VIEWS.map((view) => (
              <SelectItem key={view} value={view}>
                {viewLabels[view]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

function CodeDrawingTextarea({
  code,
  viewMode,
  readOnly = false,
  isMobile = false,
  showBorder = false,
  onCodeChange,
  toolbar,
}: {
  code: string;
  viewMode: CodeDrawingView;
  readOnly?: boolean;
  isMobile?: boolean;
  showBorder?: boolean;
  onCodeChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  toolbar?: React.ReactNode;
}) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const isCodeOnlyMode = viewMode === 'code';

  const [internalCode, setInternalCode] = React.useState(code);
  const lastExternalCodeRef = React.useRef(code);

  React.useEffect(() => {
    if (code !== lastExternalCodeRef.current) {
      lastExternalCodeRef.current = code;
      setInternalCode(code);
    }
  }, [code]);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setInternalCode(newValue);
      onCodeChange(e);
    },
    [onCodeChange]
  );

  return (
    <div
      className={`${
        isCodeOnlyMode ? 'w-full' : 'min-w-0 flex-1'
      } flex flex-col ${isCodeOnlyMode && !isMobile ? 'relative' : ''} ${
        showBorder && !isMobile ? 'border-r' : ''
      }`}
    >
      {toolbar && isCodeOnlyMode && (
        <div
          className={
            isMobile
              ? 'mt-2 mb-2 flex justify-end px-2'
              : 'absolute right-2 z-10 mt-2'
          }
        >
          {toolbar}
        </div>
      )}

      <div className="relative flex-1 rounded-md">
        <pre
          className="m-0 overflow-x-auto p-8 pr-4 font-mono text-sm leading-[normal] [tab-size:2] print:break-inside-avoid"
          style={{ minHeight: `${DEFAULT_MIN_HEIGHT}px`, height: '100%' }}
        >
          <code className="block h-full w-full">
            <textarea
              ref={textareaRef}
              value={internalCode}
              onChange={handleChange}
              readOnly={readOnly}
              className="m-0 h-full w-full resize-none overflow-auto border-0 bg-transparent p-0 font-mono text-sm outline-none"
              style={{ minHeight: `${DEFAULT_MIN_HEIGHT}px` }}
              placeholder="Enter your code here..."
              spellCheck={false}
            />
          </code>
        </pre>
      </div>
    </div>
  );
}

function CodeDrawingPreviewArea({
  image,
  loading,
  renderError,
  code,
  viewMode,
  readOnly: _readOnly = false,
  isMobile = false,
  showBorder = false,
  toolbar,
}: {
  image: string;
  loading: boolean;
  renderError: string | null;
  code: string;
  viewMode: CodeDrawingView;
  readOnly?: boolean;
  isMobile?: boolean;
  showBorder?: boolean;
  toolbar?: React.ReactNode;
}) {
  const showPreview = viewMode === 'split' || viewMode === 'preview';

  return (
    <div
      className={`flex min-w-0 flex-1 flex-col ${isMobile ? '' : 'relative'} ${
        showBorder && isMobile ? 'border-b' : ''
      }`}
    >
      {toolbar && (
        <div
          className={
            isMobile
              ? 'mt-2 mb-2 flex justify-end px-2'
              : 'absolute right-2 z-10 mt-2'
          }
        >
          {toolbar}
        </div>
      )}

      {showPreview ? (
        <div className="flex flex-1 items-center justify-center rounded-md bg-muted/30 p-4">
          {loading && <div className="text-muted-foreground">Loading...</div>}
          {!loading &&
            image && (
              // oxlint-disable-next-line nextjs/no-img-element -- [P1 local-invariant] The renderer returns an ephemeral preview data URL; optimization and remote loading do not apply.
              <img
                src={image}
                alt="code drawing"
                className="max-h-full max-w-full object-contain"
              />
            )}
          {!loading && !image && renderError && (
            <div className="text-destructive" title={renderError}>
              Could not render preview. Edit the source to retry.
            </div>
          )}
          {!loading && !image && !renderError && (
            <div className="text-muted-foreground">
              {code.trim() ? 'Rendering...' : 'Preview will appear here'}
            </div>
          )}
        </div>
      ) : (
        <div className="pointer-events-none flex flex-1 items-center justify-center rounded-md border bg-muted/30 p-4 opacity-0">
          {/* Placeholder to maintain height */}
        </div>
      )}
    </div>
  );
}

export const CodeDrawingKit = [
  CodeDrawingPlugin.configure({ component: CodeDrawingElement }),
];
