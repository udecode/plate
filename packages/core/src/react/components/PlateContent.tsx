import React, { useRef } from 'react';

import { Editable, useOptionalEditorReadOnly } from '@platejs/plite-react';
import { useComposedRef } from '@udecode/react-utils';
import { useAtomStoreValue } from 'jotai-x';

import type { EditableProps } from '../../lib/types/EditableProps';

import { setPlateChangeCallbacks } from '../../internal/plugin/plateChangeHandlers';
import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import { useEditableProps } from '../hooks';
import type { PlateEditor } from '../editor/PlateEditor';
import { type PlateStoreState, useEditorRef, usePlateStore } from '../stores';
import { EditorHotkeysEffect } from './EditorHotkeysEffect';
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
 * - Decorate prop
 * - DOM handler props
 * - ReadOnly prop
 * - Render.afterEditable
 * - Render.beforeEditable
 * - RenderElement prop
 * - RenderLeaf prop
 * - UseHooks
 */
const PlateContent = React.forwardRef<HTMLDivElement, PlateContentProps>(
  (
    {
      autoFocusOnEditable,
      readOnly: readOnlyProp,
      renderEditable,
      ...props
    }: PlateContentProps,
    ref
  ) => {
    const { id } = props;

    const editor = useEditorRef(id);
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
);
PlateContent.displayName = 'PlateContent';

const PlateContentBranch = React.forwardRef<
  HTMLDivElement,
  PlateContentProps & {
    editor: PlateEditor;
    plateReadOnly: boolean;
  }
>(
  (
    { autoFocusOnEditable, editor, plateReadOnly, renderEditable, ...props },
    ref
  ) => {
    const { id } = props;

    const editableProps = useEditableProps({
      ...props,
      readOnly: plateReadOnly,
    });

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

    editor.runtime.pluginCache.render.beforeEditable.forEach((key) => {
      const plugin = editor.getPlugin({ key });
      if (isEditOnly(plateReadOnly, plugin, 'render')) return;

      const BeforeEditable = plugin.render.beforeEditable!;

      beforeEditable = (
        <>
          {beforeEditable}
          <BeforeEditable {...editableProps} />
        </>
      );
    });

    editor.runtime.pluginCache.render.afterEditable.forEach((key) => {
      const plugin = editor.getPlugin({ key });
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

        <EditorHotkeysEffect id={id} editableRef={editableRef} />
        <EditorRefEffect id={id} />
        <PlateControllerEffect id={id} />
      </>
    );

    editor.runtime.pluginCache.render.aboveEditable.forEach((key) => {
      const plugin = editor.getPlugin({ key });
      if (isEditOnly(plateReadOnly, plugin, 'render')) return;

      const AboveEditable = plugin.render.aboveEditable!;

      aboveEditable = <AboveEditable>{aboveEditable}</AboveEditable>;
    });

    return (
      <PlateRoot id={id}>
        <PlateContentStateEffect
          id={id}
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
);
PlateContentBranch.displayName = 'PlateContentBranch';

function PlateContentStateEffect({
  id,
  autoFocusOnEditable,
  editor,
  readOnly,
}: {
  editor: PlateEditor;
  id?: string;
  autoFocusOnEditable?: boolean;
  readOnly?: boolean;
}) {
  const store = usePlateStore(id);

  const onNodeChange = useAtomStoreValue(store, 'onNodeChange') as NonNullable<
    PlateStoreState['onNodeChange']
  > | null;
  const onTextChange = useAtomStoreValue(store, 'onTextChange') as NonNullable<
    PlateStoreState['onTextChange']
  > | null;

  React.useLayoutEffect(() => {
    setPlateChangeCallbacks(editor, {
      onNodeChange,
      onTextChange,
    });

    return () => {
      setPlateChangeCallbacks(editor, {});
    };
  }, [editor, onNodeChange, onTextChange]);

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
