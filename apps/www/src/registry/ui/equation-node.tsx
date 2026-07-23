'use client';

import * as React from 'react';
import TextareaAutosize, {
  type TextareaAutosizeProps,
} from 'react-textarea-autosize';

import type { TEquationElement } from 'platejs';
import type { PlateEditor, PlateElementProps } from 'platejs/react';

import { useEquationElement, useEquationInput } from '@platejs/math/react';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { CornerDownLeftIcon, RadicalIcon } from 'lucide-react';
import {
  createPrimitiveComponent,
  PlateElement,
  useEditor,
  useEditorSelector,
  useElement,
  useEditorReadOnly,
  useElementSelected,
} from 'platejs/react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { inlineSuggestionVariants } from '@/registry/lib/suggestion';

const getBlockSelectionApi = (editor: PlateEditor) =>
  editor.plugin(BlockSelectionPlugin).api;

export function EquationElement(props: PlateElementProps<TEquationElement>) {
  const selected = useElementSelected();
  const [open, setOpen] = React.useState(selected);
  const katexRef = React.useRef<HTMLDivElement | null>(null);
  const lineBreakBadge = (
    props as PlateElementProps<TEquationElement> & {
      lineBreakBadge?: React.ReactNode;
    }
  ).lineBreakBadge;

  useEquationElement({
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
        <PopoverTrigger asChild>
          <button
            aria-label={
              props.element.texExpression.length > 0
                ? 'Edit equation'
                : 'Add equation'
            }
            className={cn(
              'group flex cursor-pointer select-none items-center justify-center rounded-sm hover:bg-primary/10 data-[selected=true]:bg-primary/10',
              props.element.texExpression.length === 0
                ? 'bg-muted p-3 pr-9'
                : 'px-2 py-1'
            )}
            data-selected={selected}
            contentEditable={false}
            type="button"
          >
            {props.element.texExpression.length > 0 ? (
              <span ref={katexRef} />
            ) : (
              <span className="flex h-7 w-full items-center gap-2 whitespace-nowrap text-muted-foreground text-sm">
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
  props: PlateElementProps<TEquationElement>
) {
  const { element } = props;
  const katexRef = React.useRef<HTMLDivElement | null>(null);
  const selected = useElementSelected();
  const isCollapsed = useEditorSelector((editor) =>
    editor.read.selection.isCollapsed()
  );
  const [open, setOpen] = React.useState(selected && isCollapsed);

  React.useEffect(() => {
    if (selected && isCollapsed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Open the inline equation popover when editor selection enters it.
      setOpen(true);
    }
  }, [selected, isCollapsed]);

  useEquationElement({
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
        <PopoverTrigger asChild>
          <button
            aria-label={
              element.texExpression.length > 0
                ? 'Edit equation'
                : 'Add equation'
            }
            className={cn(
              'after:-top-0.5 after:-left-1 after:absolute after:inset-0 after:z-1 after:h-[calc(100%)+4px] after:w-[calc(100%+8px)] after:rounded-sm after:content-[""]',
              'h-6',
              inlineSuggestionVariants(),
              ((element.texExpression.length > 0 && open) || selected) &&
                'after:bg-brand/15',
              element.texExpression.length === 0 &&
                'text-muted-foreground after:bg-neutral-500/10'
            )}
            contentEditable={false}
            type="button"
          >
            <span
              ref={katexRef}
              className={cn(
                element.texExpression.length === 0 && 'hidden',
                'font-mono leading-none'
              )}
            />
            {element.texExpression.length === 0 && (
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

const useEquationInputState = (
  options: Parameters<typeof useEquationInput>[0]
) => options;

const EquationInput = createPrimitiveComponent(TextareaAutosize)({
  propsHook: useEquationInput,
  stateHook: useEquationInputState,
});

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
  const element = useElement<TEquationElement>();

  React.useEffect(() => {
    if (isInline && open) {
      setOpen(true);
    }
  }, [isInline, open, setOpen]);

  if (readOnly) return null;

  const onClose = () => {
    setOpen(false);

    if (isInline) {
      const nextPoint = editor.read.points.after(element);

      if (nextPoint) {
        editor.update.selection.set(nextPoint);
      }
      editor.api.dom.focus();
    } else {
      getBlockSelectionApi(editor).set(element.id as string);
    }
  };

  return (
    <PopoverContent
      className="flex gap-2"
      onEscapeKeyDown={(e) => {
        e.preventDefault();
      }}
      contentEditable={false}
    >
      <EquationInput
        className={cn('max-h-[50vh] grow resize-none p-2 text-sm', className)}
        options={{ isInline, open, onClose }}
        autoFocus
        {...props}
      />

      <Button variant="secondary" className="px-3" onClick={onClose}>
        Done <CornerDownLeftIcon className="size-3.5" />
      </Button>
    </PopoverContent>
  );
};
