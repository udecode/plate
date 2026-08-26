'use client';

import '@platejs/math/katex.css';
import { MathRules } from '@platejs/math';
import { EquationPlugin, InlineEquationPlugin } from '@platejs/math/react';
import katex, { type KatexOptions } from 'katex';
import { CornerDownLeftIcon, RadicalIcon } from 'lucide-react';
import { isHotkey } from 'platejs';
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
  FloatingPopover as Popover,
  FloatingPopoverContent as PopoverContent,
  FloatingPopoverTrigger as PopoverTrigger,
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
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger>
          <button
            aria-label={
              props.element.latex.length > 0 ? 'Edit equation' : 'Add equation'
            }
            className={cn(
              'group flex cursor-pointer select-none items-center justify-center rounded-sm hover:bg-primary/10 data-[selected=true]:bg-primary/10',
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
        </PopoverTrigger>

        <EquationPopoverContent
          open={open}
          placeholder={
            'f(x) = \\begin{cases}\n  x^2, &\\quad x > 0 \\\\\n  0, &\\quad x = 0 \\\\\n  -x^2, &\\quad x < 0\n\\end{cases}'
          }
          isInline={false}
          setOpen={setOpen}
        />
      </Popover>

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
    dismissed: false,
    selected,
  });

  if (popoverState.selected !== selected) {
    setPopoverState({ dismissed: false, selected });
  }

  const dismissed =
    popoverState.selected === selected && popoverState.dismissed;
  const open = selected && isCollapsed && !dismissed;
  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      setPopoverState({ dismissed: !nextOpen, selected });
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
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger>
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
        </PopoverTrigger>

        <EquationPopoverContent
          className="my-auto"
          open={open}
          placeholder="E = mc^2"
          setOpen={setOpen}
          isInline
        />
      </Popover>

      {props.children}
    </PlateElement>
  );
}

function EquationInput({
  isInline,
  onClose,
  open,
  ...props
}: TextareaAutosizeProps & {
  isInline?: boolean;
  open?: boolean;
  onClose?: () => void;
}) {
  const editor = useEditor();
  const element = useElement(isInline ? InlineEquationPlugin : EquationPlugin);
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const initialExpressionRef = React.useRef(element.latex);
  const effectContextRef = React.useRef({ editor, element, isInline });

  React.useEffect(() => {
    effectContextRef.current = { editor, element, isInline };
  }, [editor, element, isInline]);

  React.useEffect(() => {
    if (!open) return undefined;

    const timeoutId = window.setTimeout(() => {
      ref.current?.focus();
      ref.current?.select();

      const context = effectContextRef.current;

      if (context.isInline) {
        initialExpressionRef.current = context.element.latex;
      }
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [open]);

  const setExpression = (latex: string) => {
    const at = editor.read.nodes.path(element);

    if (!at) return;

    if (isInline) {
      editor
        .plugin(InlineEquationPlugin)
        .update({ history: 'merge' })
        .set({ latex }, { at });
    } else {
      editor.plugin(EquationPlugin).update.set({ latex }, { at });
    }
  };

  const dismiss = () => {
    if (isInline) setExpression(initialExpressionRef.current);

    onClose?.();
  };

  const selectOutside = (direction: 'after' | 'before') => {
    const point = editor.read.points[direction](element);

    if (!point) return;

    editor.update.selection.set(point);
    editor.api.dom.focus();
  };

  return (
    <TextareaAutosize
      ref={ref}
      value={element.latex}
      onChange={(event) => {
        setExpression(event.currentTarget.value);
      }}
      onKeyDown={(event) => {
        if (isHotkey('enter')(event)) {
          event.preventDefault();
          onClose?.();
        } else if (isHotkey('escape')(event)) {
          event.preventDefault();
          dismiss();
        }
        if (!isInline) return;

        const { selectionEnd, selectionStart } = event.currentTarget;

        if (
          selectionStart === 0 &&
          selectionEnd === 0 &&
          isHotkey('ArrowLeft')(event)
        ) {
          event.preventDefault();
          selectOutside('before');
        }
        if (
          selectionEnd === element.latex.length &&
          selectionStart === element.latex.length &&
          isHotkey('ArrowRight')(event)
        ) {
          event.preventDefault();
          selectOutside('after');
        }
      }}
      {...props}
    />
  );
}

const EquationPopoverContent = ({
  className,
  isInline,
  open,
  setOpen,
  ...props
}: {
  isInline: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
} & TextareaAutosizeProps) => {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const element = useElement(isInline ? InlineEquationPlugin : EquationPlugin);

  if (readOnly) return null;

  const onClose = () => {
    setOpen(false);

    if (isInline) {
      const nextPoint = editor.read.points.after(element);

      if (nextPoint) {
        editor.update.selection.set(nextPoint);
      }
    } else {
      const path = editor.read.nodes.path(element);

      if (path) {
        editor.update.selection.setNodes([path]);
      }
    }
    editor.api.dom.focus();
  };

  return (
    <PopoverContent
      className="flex gap-2"
      onFinalFocus={(event) => {
        if (isInline) event.preventDefault();
      }}
      onEscapeKeyDown={(e) => {
        e.preventDefault();
      }}
      contentEditable={false}
    >
      <EquationInput
        className={cn('max-h-[50vh] grow resize-none p-2 text-sm', className)}
        isInline={isInline}
        onClose={onClose}
        open={open}
        autoFocus
        {...props}
      />

      <Button variant="secondary" className="px-3" onClick={onClose}>
        Done <CornerDownLeftIcon className="size-3.5" />
      </Button>
    </PopoverContent>
  );
};

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
