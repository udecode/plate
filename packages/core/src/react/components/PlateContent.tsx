'use client';

import {
  Editable,
  type EditableProps as PliteEditableProps,
  useOptionalEditorReadOnly,
} from '@platejs/plite-react';
import { useHotkeysContext } from '@udecode/react-hotkeys';
import { useComposedRef } from '@udecode/react-utils';
import clsx from 'clsx';
import { useAtomStoreValue } from 'jotai-x';
import omit from 'lodash/omit.js';
import React, { useRef } from 'react';
import { useDeepCompareMemo } from 'use-deep-compare';

import {
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import type { EditableProps } from '../../lib/types/EditableProps';
import { pipeDecorate } from '../../static/utils/pipeDecorate';
import type { PlateEditor } from '../editor/PlateEditor';
import { usePlateModelRevision } from '../internal/usePlateModelRevision';
import { type PlateStoreState, useEditor, usePlateStore } from '../stores';
import { dispatchPlateShortcut } from '../utils/dispatchPlateShortcut';
import { DOM_HANDLERS } from '../utils/dom-attributes';
import { pipeHandler } from '../utils/pipeHandler';
import { pipeRenderElement } from '../utils/pipeRenderElement';
import { pipeRenderLeaf } from '../utils/pipeRenderLeaf';
import { pipeRenderText } from '../utils/pipeRenderText';
import { EditorRefEffect } from './EditorRefEffect';
import { PlateControllerEffect } from './PlateControllerEffect';
import { PlateRoot } from './PlateRoot';

export type PlateContentProps = Omit<EditableProps, 'decorate'> & {
  /** Autofocus when it becomes editable (readOnly false -> readOnly true) */
  autoFocusOnEditable?: boolean;
  decorate?: PlateStoreState['decorate'];
  disabled?: boolean;
  /** R enders the editable content. */
  renderEditable?: (editable: React.ReactElement) => React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
};

const renderDefaultPlatePlaceholder: NonNullable<
  PlateContentProps['renderPlaceholder']
> = ({ attributes, children }) => (
  <span
    {...attributes}
    style={{
      ...attributes.style,
      opacity: 0.333,
      textDecoration: 'none',
    }}
  >
    {children}
  </span>
);

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
 * - Decorate prop
 * - DOM handler props
 * - ReadOnly prop
 * - Render.afterEditable
 * - Render.beforeEditable
 * - RenderElement prop
 * - RenderLeaf prop
 * - UseHooks
 */
function PlateContent({
  autoFocusOnEditable,
  readOnly: readOnlyProp,
  ref,
  renderEditable,
  ...props
}: PlateContentProps) {
  const { id } = props;

  const editor = useEditor({ id });
  const plateReadOnly = useOptionalEditorReadOnly();

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

  return (
    <PlateContentBranch
      {...props}
      ref={ref}
      autoFocusOnEditable={autoFocusOnEditable}
      editor={editor}
      plateReadOnly={readOnly}
      readOnly={readOnlyProp}
      renderEditable={renderEditable}
    />
  );
}

function PlateContentBranch({
  autoFocusOnEditable,
  editor,
  plateReadOnly,
  ref,
  renderEditable,
  ...props
}: PlateContentProps & {
  editor: PlateEditor;
  plateReadOnly: boolean;
}) {
  const { disabled, ...editableInput } = {
    ...props,
    readOnly: plateReadOnly,
    renderPlaceholder:
      props.renderPlaceholder ??
      (props.disableDefaultStyles ? undefined : renderDefaultPlatePlaceholder),
  };
  const { id } = editableInput;
  const { activeScopes } = useHotkeysContext();
  const modelRevision = usePlateModelRevision(editor);
  const shortcutTable = getPlateRuntime(editor).shortcutTable;
  const store = usePlateStore(id);
  const storeDecorate = useAtomStoreValue(store, 'decorate');
  const storeRenderElement = useAtomStoreValue(store, 'renderElement');
  const storeRenderLeaf = useAtomStoreValue(store, 'renderLeaf');
  const storeRenderText = useAtomStoreValue(store, 'renderText');
  const decorate = React.useMemo(() => {
    void modelRevision;

    return pipeDecorate(
      editor,
      storeDecorate ?? (editableInput.decorate as any)
    );
  }, [editableInput.decorate, editor, modelRevision, storeDecorate]);
  const renderElement = React.useMemo(() => {
    void modelRevision;

    return pipeRenderElement(
      editor,
      storeRenderElement ?? editableInput.renderElement
    );
  }, [editableInput.renderElement, editor, modelRevision, storeRenderElement]);
  const renderLeaf = React.useMemo(() => {
    void modelRevision;

    return pipeRenderLeaf(editor, storeRenderLeaf ?? editableInput.renderLeaf);
  }, [editableInput.renderLeaf, editor, modelRevision, storeRenderLeaf]);
  const renderText = React.useMemo(() => {
    void modelRevision;

    return pipeRenderText(editor, storeRenderText ?? editableInput.renderText);
  }, [editableInput.renderText, editor, modelRevision, storeRenderText]);
  const scrollSelectionIntoView = React.useMemo<
    PliteEditableProps['scrollSelectionIntoView']
  >(() => {
    if (!editableInput.scrollSelectionIntoView) return;

    return (_editor, domRange) => {
      editableInput.scrollSelectionIntoView?.(editor, domRange);
    };
  }, [editableInput, editor]);
  const pipedProps: PliteEditableProps = useDeepCompareMemo(() => {
    const nextProps: PliteEditableProps = {
      decorate,
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
            activeScopes,
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
    activeScopes,
    decorate,
    editableInput,
    editor,
    renderElement,
    renderLeaf,
    renderText,
    shortcutTable,
  ]);
  const editableProps = useDeepCompareMemo(
    () => ({
      ...omit(editableInput, [
        ...DOM_HANDLERS,
        'renderElement',
        'renderLeaf',
        'renderText',
        'decorate',
        'scrollSelectionIntoView',
      ]),
      ...pipedProps,
      'aria-disabled': disabled,
      className: clsx(
        'plite-editor',
        'ignore-click-outside/toolbar',
        editableInput.className
      ),
      'data-readonly': plateReadOnly ? 'true' : undefined,
      readOnly: plateReadOnly,
    }),
    [disabled, editableInput, pipedProps, plateReadOnly]
  );

  const editableRef = useRef<HTMLDivElement | null>(null);
  const combinedRef = useComposedRef(ref, editableRef);

  const children = editor.read.children();

  // Don't render if editor is not ready (e.g., async value still loading)
  if (children.length === 0) {
    return null;
  }

  const editable = <Editable ref={combinedRef} {...editableProps} />;

  let afterEditable: React.ReactNode = null;
  let beforeEditable: React.ReactNode = null;

  getPlateRuntime(editor).pluginCache.render.beforeEditable.forEach((name) => {
    const plugin = getCompiledPlatePlugin(editor, name)!;
    if (isEditOnly(plateReadOnly, plugin, 'render')) return;

    const BeforeEditable = plugin.render.beforeEditable!;

    beforeEditable = (
      <>
        {beforeEditable}
        <BeforeEditable {...editableProps} />
      </>
    );
  });

  getPlateRuntime(editor).pluginCache.render.afterEditable.forEach((name) => {
    const plugin = getCompiledPlatePlugin(editor, name)!;
    if (isEditOnly(plateReadOnly, plugin, 'render')) return;

    const AfterEditable = plugin.render.afterEditable!;

    afterEditable = (
      <>
        {afterEditable}
        <AfterEditable {...editableProps} />
      </>
    );
  });

  let aboveEditable: React.ReactNode = (
    <>
      {renderEditable ? renderEditable(editable) : editable}

      <EditorRefEffect id={id} />
      <PlateControllerEffect id={id} />
    </>
  );

  getPlateRuntime(editor).pluginCache.render.aboveEditable.forEach((name) => {
    const plugin = getCompiledPlatePlugin(editor, name)!;
    if (isEditOnly(plateReadOnly, plugin, 'render')) return;

    const AboveEditable = plugin.render.aboveEditable!;

    aboveEditable = <AboveEditable>{aboveEditable}</AboveEditable>;
  });

  return (
    <PlateRoot id={id}>
      <PlateContentStateEffect
        autoFocusOnEditable={autoFocusOnEditable}
        editor={editor}
        readOnly={plateReadOnly}
      />

      {beforeEditable}
      {aboveEditable}
      {afterEditable}
    </PlateRoot>
  );
}

function PlateContentStateEffect({
  autoFocusOnEditable,
  editor,
  readOnly,
}: {
  editor: PlateEditor;
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
