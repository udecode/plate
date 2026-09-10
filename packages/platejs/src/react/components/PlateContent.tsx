'use client';

import { clsx } from 'clsx';
import omit from 'lodash/omit.js';
import React, { useRef } from 'react';

import type { Element, RootKey } from '../../facade';
import { failInvariant } from '../../internal/failInvariant';
import {
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import type { Editor } from '../editor/Editor';
import { usePlateModel } from '../internal/plate-context';
import {
  Editable,
  type EditableProps as PliteEditableProps,
} from '../internal/plite-components';
import { useComposedRef } from '../internal/react-helpers';
import { PlateRenderedAttributeProvider } from '../internal/rendered-attributes';
import { useDeepCompareMemo } from '../internal/useDeepCompareMemo';
import { usePlateModelRevision } from '../internal/usePlateModelRevision';
import { useEditor } from '../stores';
import { dispatchPlateShortcut } from '../utils/dispatchPlateShortcut.internal';
import { DOM_HANDLERS } from '../utils/dom-attributes.internal';
import { pipeHandler } from '../utils/pipeHandler.internal';
import { pipeRenderElement } from '../utils/pipeRenderElement.internal';
import { pipeRenderLeaf } from '../utils/pipeRenderLeaf.internal';
import { pipeRenderText } from '../utils/pipeRenderText.internal';
import { EditorRefEffect } from './EditorRefEffect';
import { PlateRoot } from './PlateRoot.internal';

export type PlateContentProps<
  TElement extends Element = Element,
  TRoot extends RootKey = RootKey,
> = Omit<
  PliteEditableProps<TElement, TRoot>,
  | 'renderElement'
  | 'renderLeaf'
  | 'renderPlaceholder'
  | 'renderText'
  | 'renderVoid'
> & {
  /** Autofocus when it becomes editable (readOnly false -> readOnly true) */
  autoFocusOnEditable?: boolean;
  disabled?: boolean;
  ref?: React.Ref<HTMLDivElement>;
};

const getPlateContentReadOnly = ({
  disabled,
  plateReadOnly,
  readOnly,
}: {
  disabled?: boolean;
  plateReadOnly?: boolean;
  readOnly?: boolean;
}) => (disabled ? true : (readOnly ?? plateReadOnly ?? false));

/**
 * Editable with plugins.
 *
 * - DOM handler props
 * - ReadOnly prop
 * - Slots.afterEditable
 * - Slots.beforeEditable
 * - Plugin renderers and hooks
 */
function PlateContent<
  TElement extends Element = Element,
  TRoot extends RootKey = RootKey,
>({
  autoFocusOnEditable,
  readOnly: readOnlyProp,
  ref,
  ...props
}: PlateContentProps<TElement, TRoot>) {
  const { editor, readOnly: plateReadOnly } = usePlateModel();
  const editableRef = useRef<HTMLDivElement | null>(null);
  const previousElementRef = useRef<{
    element: HTMLDivElement;
    generation: number;
  } | null>(null);
  const [viewGeneration, setViewGeneration] = React.useState(0);
  const bindEditable = React.useCallback(
    (element: HTMLDivElement | null) => {
      editableRef.current = element;
      if (!element) return;
      const previous = previousElementRef.current;
      previousElementRef.current = { element, generation: viewGeneration };
      if (
        previous?.generation === viewGeneration &&
        previous.element !== element
      ) {
        setViewGeneration((generation) => generation + 1);
      }
    },
    [viewGeneration]
  );
  const combinedRef = useComposedRef(ref, bindEditable);

  const readOnly = getPlateContentReadOnly({
    disabled: props.disabled,
    plateReadOnly: plateReadOnly ?? editor.read.view.isReadOnly(),
    readOnly: readOnlyProp,
  });

  if (!editor) {
    throw new Error(
      'Editor not found. Please ensure that PlateContent is rendered below Plate.'
    );
  }

  const branchProps = props as PlateContentProps;

  return (
    <PlateRoot
      key={viewGeneration}
      editableRef={editableRef}
      readOnly={readOnly}
      root={props.root}
    >
      <PlateContentBranch
        {...branchProps}
        ref={combinedRef}
        editableRef={editableRef}
        autoFocusOnEditable={autoFocusOnEditable}
        plateReadOnly={readOnly}
        readOnly={readOnlyProp}
      />
    </PlateRoot>
  );
}

function PlateContentBranch({
  autoFocusOnEditable,
  editableRef,
  plateReadOnly,
  ref,
  ...props
}: PlateContentProps & {
  editableRef: React.RefObject<HTMLDivElement | null>;
  plateReadOnly: boolean;
}) {
  const editor = useEditor();
  const { disabled, root, ...editableInput } = {
    ...props,
    readOnly: plateReadOnly,
  };
  const modelRevision = usePlateModelRevision(editor);
  const { shortcutTable } = getPlateRuntime(editor);
  const renderElement = React.useMemo(() => {
    void modelRevision;

    return pipeRenderElement(editor);
  }, [editor, modelRevision]);
  const renderLeaf = React.useMemo(() => {
    void modelRevision;

    return pipeRenderLeaf(editor);
  }, [editor, modelRevision]);
  const renderText = React.useMemo(() => {
    void modelRevision;

    return pipeRenderText(editor);
  }, [editor, modelRevision]);
  const scrollSelectionIntoView = React.useMemo<
    PliteEditableProps['scrollSelectionIntoView']
  >(() => {
    if (!editableInput.scrollSelectionIntoView) return undefined;

    return (_editor, domRange) => {
      editableInput.scrollSelectionIntoView?.(editor, domRange);
    };
  }, [editableInput, editor]);
  const pipedProps: PliteEditableProps = useDeepCompareMemo(() => {
    const nextProps: PliteEditableProps = {
      renderElement,
      renderLeaf,
      renderText,
      scrollSelectionIntoView,
    };

    DOM_HANDLERS.forEach((handlerKey) => {
      const handler = pipeHandler(editor, {
        editableProps: editableInput,
        handlerKey,
      }) as any;
      const shortcutPhase =
        handlerKey === 'onKeyDown'
          ? 'keydown'
          : handlerKey === 'onKeyUp'
            ? 'keyup'
            : null;
      const hasShortcut =
        shortcutPhase && shortcutTable.some((item) => item[shortcutPhase]);

      if (hasShortcut) {
        nextProps[handlerKey] = ((
          event: React.KeyboardEvent<HTMLDivElement>
        ) => {
          const shortcutHandled = dispatchPlateShortcut(
            editor,
            event.nativeEvent,
            shortcutPhase,
            shortcutTable
          );

          if (!shortcutHandled) return handler?.(event);

          if (
            event.nativeEvent.defaultPrevented &&
            !event.isDefaultPrevented()
          ) {
            event.preventDefault();
          }

          // oxlint-disable-next-line typescript/no-deprecated -- [P1 local-invariant] Detect propagation stopped directly on the native event, then synchronize React's event flag.
          if (event.nativeEvent.cancelBubble) {
            event.stopPropagation();

            return true;
          }

          return handler?.(event);
        }) as any;
      } else if (handler) {
        nextProps[handlerKey] = handler;
      }
    });

    return nextProps;
  }, [
    editableInput,
    editor,
    renderElement,
    renderLeaf,
    renderText,
    shortcutTable,
  ]);
  const editableProps = useDeepCompareMemo(
    () => ({
      ...omit(editableInput, [...DOM_HANDLERS, 'scrollSelectionIntoView']),
      ...pipedProps,
      'aria-disabled': disabled,
      className: clsx('plite-editor', editableInput.className),
      'data-readonly': plateReadOnly ? 'true' : undefined,
      readOnly: plateReadOnly,
    }),
    [disabled, editableInput, pipedProps, plateReadOnly]
  );

  const children = editor.read.children();

  // Don't render if editor is not ready (e.g., async value still loading)
  if (children.length === 0) {
    return null;
  }

  const editable = <Editable ref={ref} {...editableProps} />;

  let afterEditable: React.ReactNode = null;
  let beforeEditable: React.ReactNode = null;

  getPlateRuntime(editor).pluginCache.slots.beforeEditable.forEach((name) => {
    const plugin =
      getCompiledPlatePlugin(editor, name) ??
      failInvariant('Expected value to be defined');
    if (isEditOnly(plateReadOnly, plugin, 'slots')) return;

    const BeforeEditable =
      plugin.slots.beforeEditable ??
      failInvariant('Expected value to be defined');

    beforeEditable = (
      <>
        {beforeEditable}
        <BeforeEditable editableRef={editableRef} />
      </>
    );
  });

  getPlateRuntime(editor).pluginCache.slots.afterEditable.forEach((name) => {
    const plugin =
      getCompiledPlatePlugin(editor, name) ??
      failInvariant('Expected value to be defined');
    if (isEditOnly(plateReadOnly, plugin, 'slots')) return;

    const AfterEditable =
      plugin.slots.afterEditable ??
      failInvariant('Expected value to be defined');

    afterEditable = (
      <>
        {afterEditable}
        <AfterEditable editableRef={editableRef} />
      </>
    );
  });

  let content: React.ReactNode = (
    <PlateRenderedAttributeProvider>
      {editable}

      <EditorRefEffect />
    </PlateRenderedAttributeProvider>
  );

  getPlateRuntime(editor).pluginCache.slots.wrapContent.forEach((name) => {
    const plugin =
      getCompiledPlatePlugin(editor, name) ??
      failInvariant('Expected value to be defined');
    if (isEditOnly(plateReadOnly, plugin, 'slots')) return;

    const WrapContent =
      plugin.slots.wrapContent ?? failInvariant('Expected value to be defined');

    content = <WrapContent>{content}</WrapContent>;
  });

  return (
    <>
      <PlateContentStateEffect
        autoFocusOnEditable={autoFocusOnEditable}
        editor={editor}
        readOnly={plateReadOnly}
      />

      {beforeEditable}
      {content}
      {afterEditable}
    </>
  );
}

function PlateContentStateEffect({
  autoFocusOnEditable,
  editor,
  readOnly,
}: {
  editor: Editor;
  autoFocusOnEditable?: boolean;
  readOnly?: boolean;
}) {
  const prevReadOnly = React.useRef(readOnly);

  React.useEffect(() => {
    if (autoFocusOnEditable && prevReadOnly.current && !readOnly) {
      const point = editor.read.points.end([]);

      if (point) {
        editor.update.selection.set({ anchor: point, focus: point });
        editor.api.dom.focus();
      }
    }

    prevReadOnly.current = readOnly;
  }, [autoFocusOnEditable, editor, readOnly]);

  return null;
}

export { PlateContent };
