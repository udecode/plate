import React, { useRef } from 'react';

import { useComposedRef } from '@udecode/react-utils';
import { isDefined } from '@udecode/utils';

import type { EditableProps } from '../../lib/types/EditableProps';
import type { PlateEditor } from '../editor';

import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import { useEditableProps } from '../hooks';
import { Editable } from '../slate-react';
import {
  type PlateStoreState,
  useEditorReadOnly,
  useEditorRef,
  usePlateStore,
} from '../stores';
import { EditorHotkeysEffect } from './EditorHotkeysEffect';
import { EditorMethodsEffect } from './EditorMethodsEffect';
import { EditorRefEffect } from './EditorRefEffect';
import { PlateControllerEffect } from './PlateControllerEffect';
import { PlateSlate } from './PlateSlate';

export type PlateContentProps = Omit<EditableProps, 'decorate'> & {
  /** Autofocus when it becomes editable (readOnly false -> readOnly true) */
  autoFocusOnEditable?: boolean;
  decorate?: PlateStoreState['decorate'];
  disabled?: boolean;
  /** R enders the editable content. */
  renderEditable?: (editable: React.ReactElement<any>) => React.ReactNode;
};

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
const PlateContent = React.forwardRef(
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

    const storeReadOnly = useEditorReadOnly();
    const readOnly = props.disabled ? true : (readOnlyProp ?? storeReadOnly);

    // Can't be in useLayoutEffect for the first render
    editor.dom.readOnly = readOnly;

    if (!editor) {
      throw new Error(
        'Editor not found. Please ensure that PlateContent is rendered below Plate.'
      );
    }

    const editableProps = useEditableProps({ ...props, readOnly });

    const editableRef = useRef<HTMLDivElement | null>(null);
    const combinedRef = useComposedRef(ref, editableRef);

    const editable = <Editable ref={combinedRef} {...(editableProps as any)} />;

    let afterEditable: React.ReactNode = null;
    let beforeEditable: React.ReactNode = null;

    editor.meta.pluginCache.render.beforeEditable.forEach((key) => {
      const plugin = editor.getPlugin({ key });
      if (isEditOnly(readOnly, plugin, 'render')) return;

      const BeforeEditable = plugin.render.beforeEditable!;

      beforeEditable = (
        <>
          {beforeEditable}
          <BeforeEditable {...editableProps} />
        </>
      );
    });

    editor.meta.pluginCache.render.afterEditable.forEach((key) => {
      const plugin = editor.getPlugin({ key });
      if (isEditOnly(readOnly, plugin, 'render')) return;

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

        <EditorMethodsEffect id={id} />
        <EditorHotkeysEffect id={id} editableRef={editableRef} />
        <EditorRefEffect id={id} />
        <PlateControllerEffect id={id} />
      </>
    );

    editor.meta.pluginCache.render.aboveEditable.forEach((key) => {
      const plugin = editor.getPlugin({ key });
      if (isEditOnly(readOnly, plugin, 'render')) return;

      const AboveEditable = plugin.render.aboveEditable!;

      aboveEditable = <AboveEditable>{aboveEditable}</AboveEditable>;
    });

    return (
      <PlateSlate id={id}>
        <EditorStateEffect
          id={id}
          disabled={props.disabled}
          readOnly={readOnlyProp}
          autoFocusOnEditable={autoFocusOnEditable}
          editor={editor}
        />

        {beforeEditable}
        {aboveEditable}
        {afterEditable}
      </PlateSlate>
    );
  }
);
PlateContent.displayName = 'PlateContent';

export { PlateContent };

function EditorStateEffect({
  id,
  autoFocusOnEditable,
  disabled,
  editor,
  readOnly,
}: {
  editor: PlateEditor;
  id?: string;
  autoFocusOnEditable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  const store = usePlateStore(id);

  // Sync PlateContent.readOnly to Plate.readOnly
  React.useLayoutEffect(() => {
    if (disabled) {
      store.setReadOnly(true);
      return;
    }

    if (isDefined(readOnly)) {
      store.setReadOnly(readOnly);
    }
  }, [disabled, editor.dom, readOnly, store]);

  const prevReadOnly = React.useRef(readOnly);

  React.useEffect(() => {
    if (autoFocusOnEditable && prevReadOnly.current && !readOnly) {
      editor.tf.focus({ edge: 'endEditor' });
    }

    prevReadOnly.current = readOnly;
  }, [autoFocusOnEditable, editor, readOnly]);

  return null;
}
