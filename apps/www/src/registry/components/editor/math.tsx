'use client';

import 'platejs/math/katex.css';
import katex, { type KatexOptions } from 'katex';
import { CornerDownLeftIcon, RadicalIcon } from 'lucide-react';
import { isHotkey, NodeApi } from 'platejs';
import { MathRules } from 'platejs/math';
import { EquationPlugin, InlineEquationPlugin } from 'platejs/math/react';
import {
  type PlateElementProps,
  PlateElement,
  useEditor,
  useEditorReadOnly,
  useEditorSelector,
  useElement,
  useElementSelected,
} from 'platejs/react';
import * as React from 'react';
import TextareaAutosize, {
  type TextareaAutosizeProps,
} from 'react-textarea-autosize';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  FloatingPopover,
  FloatingPopoverContent,
  FloatingPopoverTrigger,
} from '@/registry/components/editor/floating-popover';
import { inlineSuggestionVariants } from '@/registry/lib/inline-suggestion';

function useEquation({
  element,
  katexRef,
  options,
}: {
  element: { latex: string };
  katexRef: React.RefObject<HTMLDivElement | null>;
  options?: KatexOptions;
}) {
  React.useEffect(() => {
    if (!katexRef.current) return;

    katex.render(element.latex, katexRef.current, {
      ...options,
      throwOnError: false,
    });
  }, [element.latex, katexRef, options]);
}

export function EquationElement(
  props: PlateElementProps<typeof EquationPlugin> & {
    lineBreakBadge?: React.ReactNode;
  }
) {
  const selected = useElementSelected();
  const [open, setOpen] = React.useState(selected);
  const katexRef = React.useRef<HTMLDivElement | null>(null);
  const { lineBreakBadge } = props;

  useEquation({
    element: props.element,
    katexRef,
    options: {
      displayMode: true,
      errorColor: '#cc0000',
      fleqn: false,
      leqno: false,
      macros: { '\\f': '#1f(#2)' },
      output: 'htmlAndMathml',
      strict: 'warn',
      throwOnError: false,
      trust: false,
    },
  });

  return (
    <PlateElement className="my-1" {...props}>
      <FloatingPopover open={open} onOpenChange={setOpen} modal={false}>
        <FloatingPopoverTrigger>
          <button
            aria-label={
              props.element.latex.length > 0 ? 'Edit equation' : 'Add equation'
            }
            className={cn(
              'group flex w-full cursor-pointer select-none items-center justify-center rounded-sm hover:bg-primary/10 data-[selected=true]:bg-primary/10',
              props.element.latex.length === 0
                ? 'bg-muted p-3 pr-9'
                : 'px-2 py-1'
            )}
            data-selected={selected}
            contentEditable={false}
            type="button"
          >
            {props.element.latex.length > 0 ? (
              <span ref={katexRef} />
            ) : (
              <span className="flex h-7 w-full items-center gap-2 text-sm whitespace-nowrap text-muted-foreground">
                <RadicalIcon className="size-6 text-muted-foreground/80" />
                <span>Add a Tex equation</span>
              </span>
            )}
            {lineBreakBadge}
          </button>
        </FloatingPopoverTrigger>

        <EquationPopoverContent
          open={open}
          placeholder={
            'f(x) = \\begin{cases}\n  x^2, &\\quad x > 0 \\\\\n  0, &\\quad x = 0 \\\\\n  -x^2, &\\quad x < 0\n\\end{cases}'
          }
          isInline={false}
          setOpen={setOpen}
        />
      </FloatingPopover>

      {props.children}
    </PlateElement>
  );
}

export function InlineEquationElement(
  props: PlateElementProps<typeof InlineEquationPlugin>
) {
  const { element } = props;
  const katexRef = React.useRef<HTMLDivElement | null>(null);
  const selected = useElementSelected();
  const isCollapsed = useEditorSelector((editor) =>
    editor.read.selection.isCollapsed()
  );
  const [popoverState, setPopoverState] = React.useState({
    open: selected && isCollapsed,
    selected,
  });
  const openAtPointerDownRef = React.useRef(false);
  const open =
    popoverState.selected === selected
      ? popoverState.open
      : selected && (popoverState.open || isCollapsed);

  if (popoverState.selected !== selected) {
    setPopoverState({ open, selected });
  }

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      setPopoverState({ open: nextOpen, selected });
    },
    [selected]
  );

  useEquation({
    element,
    katexRef,
    options: {
      displayMode: true,
      errorColor: '#cc0000',
      fleqn: false,
      leqno: false,
      macros: { '\\f': '#1f(#2)' },
      output: 'htmlAndMathml',
      strict: 'warn',
      throwOnError: false,
      trust: false,
    },
  });

  return (
    <PlateElement
      {...props}
      className={cn(
        'mx-1 inline-block select-none rounded-sm [&_.katex-display]:my-0!'
      )}
    >
      <FloatingPopover open={open} onOpenChange={setOpen} modal={false}>
        <FloatingPopoverTrigger>
          <button
            aria-label={
              element.latex.length > 0 ? 'Edit equation' : 'Add equation'
            }
            className={cn(
              'after:-top-0.5 after:-left-1 after:absolute after:inset-0 after:z-1 after:h-[calc(100%)+4px] after:w-[calc(100%+8px)] after:rounded-sm after:content-[""]',
              'h-6',
              inlineSuggestionVariants(),
              ((element.latex.length > 0 && open) || selected) &&
                'after:bg-brand/15',
              element.latex.length === 0 &&
                'text-muted-foreground after:bg-neutral-500/10'
            )}
            contentEditable={false}
            onClick={(event) => {
              if (event.detail === 0 || openAtPointerDownRef.current) return;

              event.preventDefault();
              setOpen(true);
            }}
            onPointerDown={() => {
              openAtPointerDownRef.current = open;
            }}
            type="button"
          >
            <span
              ref={katexRef}
              className={cn(
                element.latex.length === 0 && 'hidden',
                'font-mono leading-none'
              )}
            />
            {element.latex.length === 0 && (
              <span>
                <RadicalIcon className="mr-1 inline-block h-[19px] w-4 py-[1.5px] align-text-bottom" />
                New equation
              </span>
            )}
          </button>
        </FloatingPopoverTrigger>

        <EquationPopoverContent
          className="my-auto"
          open={open}
          placeholder="E = mc^2"
          setOpen={setOpen}
          isInline
        />
      </FloatingPopover>

      {props.children}
    </PlateElement>
  );
}

function EquationPopoverContent({
  className,
  isInline,
  open,
  setOpen,
  ...props
}: {
  isInline: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
} & TextareaAutosizeProps) {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const element = useElement(isInline ? InlineEquationPlugin : EquationPlugin);
  const key = editor.key(element);
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = React.useState({
    open,
    source: element.latex,
    value: element.latex,
  });
  const changedSource = draft.source !== element.latex || draft.open !== open;
  const value = changedSource ? element.latex : draft.value;

  if (changedSource) {
    setDraft({ open, source: element.latex, value: element.latex });
  }

  React.useEffect(() => {
    if (!open) return undefined;
    const window = ref.current?.ownerDocument.defaultView;
    const timeout = window?.setTimeout(() => {
      ref.current?.focus();
      ref.current?.select();
    }, 0);
    return () => window?.clearTimeout(timeout);
  }, [open]);

  if (readOnly) return null;

  const close = (commit: boolean, direction: 'after' | 'before' = 'after') => {
    const current = editor.read.nodes.get(key);
    if (
      commit &&
      current &&
      NodeApi.isElement(current[0]) &&
      current[0].type === element.type &&
      current[0].latex === element.latex &&
      value !== element.latex &&
      !editor.read.view.isReadOnly() &&
      !editor.read.nodes.elementReadOnly({ at: key })
    ) {
      const plugin = isInline ? InlineEquationPlugin : EquationPlugin;
      editor
        .plugin(plugin)
        .update({ history: 'new-batch' })
        .set({ latex: value }, { at: current[1] });
    }
    setOpen(false);
    if (isInline) {
      const point = editor.read.points[direction](element);
      if (point) editor.update.selection.set(point);
    } else if (current) {
      editor.update.selection.setNodes([current[1]]);
    }
    editor.api.dom.focus();
  };

  return (
    <FloatingPopoverContent
      className="flex gap-2"
      onFinalFocus={(event) => {
        if (isInline) event.preventDefault();
      }}
      onEscapeKeyDown={(event) => event.preventDefault()}
      contentEditable={false}
    >
      <TextareaAutosize
        ref={ref}
        className={cn('max-h-[50vh] grow resize-none p-2 text-sm', className)}
        value={value}
        onChange={(event) =>
          setDraft({
            open,
            source: element.latex,
            value: event.currentTarget.value,
          })
        }
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return;
          if (isHotkey('enter')(event)) {
            event.preventDefault();
            close(true);
          } else if (isHotkey('escape')(event)) {
            event.preventDefault();
            close(false);
          } else if (isInline) {
            const { selectionEnd, selectionStart } = event.currentTarget;
            if (
              selectionStart === 0 &&
              selectionEnd === 0 &&
              isHotkey('ArrowLeft')(event)
            ) {
              event.preventDefault();
              close(true, 'before');
            } else if (
              selectionStart === value.length &&
              selectionEnd === value.length &&
              isHotkey('ArrowRight')(event)
            ) {
              event.preventDefault();
              close(true);
            }
          }
        }}
        autoFocus
        {...props}
      />
      <Button variant="secondary" className="px-3" onClick={() => close(true)}>
        Done <CornerDownLeftIcon className="size-3.5" />
      </Button>
    </FloatingPopoverContent>
  );
}

export const MathKit = [
  InlineEquationPlugin.configure({
    component: InlineEquationElement,
    inputRules: [MathRules.markdown({ variant: '$' })],
  }),
  EquationPlugin.configure({
    component: EquationElement,
    inputRules: [MathRules.markdown({ on: 'break', variant: '$$' })],
  }),
];
