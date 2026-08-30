'use client';

import { clsx } from 'clsx';
import { useAtomStoreValue } from 'jotai-x';
import omit from 'lodash/omit.js';
import {
  type Element,
  type RootKey,
  Editable,
  type EditableProps as PliteEditableProps,
  usePliteRootEditor,
  useOptionalEditorReadOnly,
} from 'plitejs/react';
import React, { useRef } from 'react';

import { failInvariant } from '../../internal/failInvariant';
import {
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import type { EditableProps } from '../../lib/types/EditableProps';
import { pipeDecorate } from '../../static/utils/pipeDecorate';
import type { Editor } from '../editor/Editor';
import { useHotkeysContext } from '../hotkeys';
import { useComposedRef } from '../internal/react-helpers';
import { useDeepCompareMemo } from '../internal/useDeepCompareMemo';
import { usePlateModelRevision } from '../internal/usePlateModelRevision';
import { useEditor, usePlateStore } from '../stores';
import { dispatchPlateShortcut } from '../utils/dispatchPlateShortcut';
import { DOM_HANDLERS } from '../utils/dom-attributes';
import { pipeHandler } from '../utils/pipeHandler';
import { pipeRenderElement } from '../utils/pipeRenderElement';
import { pipeRenderLeaf } from '../utils/pipeRenderLeaf';
import { pipeRenderText } from '../utils/pipeRenderText';
import { EditorRefEffect } from './EditorRefEffect';
import { PlateControllerEffect } from './PlateControllerEffect';
import { PlateRoot } from './PlateRoot';

export type PlateContentProps<
  T = unknown,
  TElement extends Element = Element,
  TRoot extends RootKey = RootKey,
> = Omit<PliteEditableProps<T, TElement, TRoot>, 'decorate'> & {
  /** Autofocus when it becomes editable (readOnly false -> readOnly true) */
  autoFocusOnEditable?: boolean;
  decorate?: PliteEditableProps<T, TElement, TRoot>['decorate'];
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
function PlateContent<
  T = unknown,
  TElement extends Element = Element,
  TRoot extends RootKey = RootKey,
>({
  autoFocusOnEditable,
  readOnly: readOnlyProp,
  ref,
  renderEditable,
  ...props
}: PlateContentProps<T, TElement, TRoot>) {
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

  const branchProps = props as PlateContentProps;

  return (
    <PlateContentBranch
      {...branchProps}
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
  editor: Editor;
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
  const { shortcutTable } = getPlateRuntime(editor);
  const store = usePlateStore(id);
  const storeDecorate = useAtomStoreValue(store, 'decorate');
  const storeRenderElement = useAtomStoreValue(store, 'renderElement');
  const storeRenderLeaf = useAtomStoreValue(store, 'renderLeaf');
  const storeRenderText = useAtomStoreValue(store, 'renderText');
  const decorate = React.useMemo(() => {
    void modelRevision;

    return pipeDecorate(
      editor,
      storeDecorate as Parameters<typeof pipeDecorate>[1],
      editableInput.decorate
    );
  }, [editableInput.decorate, editor, modelRevision, storeDecorate]);
  const renderElement = React.useMemo(() => {
    void modelRevision;

    return pipeRenderElement(
      editor,
      (storeRenderElement ??
        editableInput.renderElement) as EditableProps['renderElement']
    );
  }, [editableInput.renderElement, editor, modelRevision, storeRenderElement]);
  const renderLeaf = React.useMemo(() => {
    void modelRevision;

    return pipeRenderLeaf(
      editor,
      (storeRenderLeaf ??
        editableInput.renderLeaf) as EditableProps['renderLeaf']
    );
  }, [editableInput.renderLeaf, editor, modelRevision, storeRenderLeaf]);
  const renderText = React.useMemo(() => {
    void modelRevision;

    return pipeRenderText(
      editor,
      (storeRenderText ??
        editableInput.renderText) as EditableProps['renderText']
    );
  }, [editableInput.renderText, editor, modelRevision, storeRenderText]);
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
    const plugin =
      getCompiledPlatePlugin(editor, name) ??
      failInvariant('Expected value to be defined');
    if (isEditOnly(plateReadOnly, plugin, 'render')) return;

    const BeforeEditable =
      plugin.render.beforeEditable ??
      failInvariant('Expected value to be defined');

    beforeEditable = (
      <>
        {beforeEditable}
        <BeforeEditable {...editableProps} />
      </>
    );
  });

  getPlateRuntime(editor).pluginCache.render.afterEditable.forEach((name) => {
    const plugin =
      getCompiledPlatePlugin(editor, name) ??
      failInvariant('Expected value to be defined');
    if (isEditOnly(plateReadOnly, plugin, 'render')) return;

    const AfterEditable =
      plugin.render.afterEditable ??
      failInvariant('Expected value to be defined');

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
    const plugin =
      getCompiledPlatePlugin(editor, name) ??
      failInvariant('Expected value to be defined');
    if (isEditOnly(plateReadOnly, plugin, 'render')) return;

    const AboveEditable =
      plugin.render.aboveEditable ??
      failInvariant('Expected value to be defined');

    aboveEditable = <AboveEditable>{aboveEditable}</AboveEditable>;
  });

  return (
    <PlateRoot id={id} root={props.root}>
      <PlateContentStateEffect
        autoFocusOnEditable={autoFocusOnEditable}
        editor={editor}
        readOnly={plateReadOnly}
        root={props.root}
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
  root,
}: {
  editor: Editor;
  autoFocusOnEditable?: boolean;
  readOnly?: boolean;
  root?: RootKey;
}) {
  const prevReadOnly = React.useRef(readOnly);
  const rootEditor = usePliteRootEditor(root, { readOnly });

  React.useEffect(() => {
    if (autoFocusOnEditable && prevReadOnly.current && !readOnly) {
      const point = rootEditor.read.points.end([]);

      if (point) {
        rootEditor.update.selection.set({ anchor: point, focus: point });
        editor.api.dom.focus();
      }
    }

    prevReadOnly.current = readOnly;
  }, [autoFocusOnEditable, editor, readOnly, rootEditor]);

  return null;
}

export { PlateContent };
