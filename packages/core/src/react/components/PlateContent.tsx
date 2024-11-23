import React, { useRef } from 'react';

import { useComposedRef } from '@udecode/react-utils';
import { type TEditableProps, focusEditorEdge } from '@udecode/slate-react';
import { Editable } from 'slate-react';

import { useEditableProps } from '../hooks';
import { type PlateStoreState, useEditorRef } from '../stores';
import { EditorHotkeysEffect } from './EditorHotkeysEffect';
import { EditorMethodsEffect } from './EditorMethodsEffect';
import { EditorRefEffect } from './EditorRefEffect';
import { EditorStateEffect } from './EditorStateEffect';
import { PlateControllerEffect } from './PlateControllerEffect';
import { PlateSlate } from './PlateSlate';

export type PlateContentProps = Omit<TEditableProps, 'decorate'> & {
  /** Autofocus when it becomes editable (readOnly false -> readOnly true) */
  autoFocusOnEditable?: boolean;
  decorate?: PlateStoreState['decorate'];
  disabled?: boolean;
  /** R enders the editable content. */
  renderEditable?: (editable: React.ReactElement) => React.ReactNode;
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
    { autoFocusOnEditable, renderEditable, ...props }: PlateContentProps,
    ref
  ) => {
    const { id } = props;

    const editor = useEditorRef(id);

    if (!editor) {
      throw new Error(
        'Editor not found. Please ensure that PlateContent is rendered below Plate.'
      );
    }

    const editableProps = useEditableProps(props);

    const editableRef = useRef<HTMLDivElement | null>(null);
    const combinedRef = useComposedRef(ref, editableRef);

    const editable = <Editable ref={combinedRef} {...(editableProps as any)} />;

    let afterEditable: React.ReactNode = null;
    let beforeEditable: React.ReactNode = null;

    editor.pluginList.forEach((plugin) => {
      const {
        render: {
          afterEditable: AfterEditable,
          beforeEditable: BeforeEditable,
        },
      } = plugin;

      if (AfterEditable) {
        afterEditable = (
          <>
            {afterEditable}
            <AfterEditable {...editableProps} />
          </>
        );
      }
      if (BeforeEditable) {
        beforeEditable = (
          <>
            {beforeEditable}
            <BeforeEditable {...editableProps} />
          </>
        );
      }
    });

    let aboveEditable: React.ReactNode = (
      <>
        {beforeEditable}

        {renderEditable ? renderEditable(editable) : editable}

        <EditorMethodsEffect id={id} />
        <EditorHotkeysEffect id={id} editableRef={editableRef} />
        <EditorStateEffect id={id} />
        <EditorRefEffect id={id} />
        <PlateControllerEffect id={id} />

        {afterEditable}
      </>
    );

    editor.pluginList.forEach((plugin) => {
      const {
        render: { aboveEditable: AboveEditable },
      } = plugin;

      if (AboveEditable)
        aboveEditable = <AboveEditable>{aboveEditable}</AboveEditable>;
    });

    const readOnly = props.readOnly ?? false;
    const prevReadOnly = React.useRef(readOnly);

    React.useEffect(() => {
      if (autoFocusOnEditable && prevReadOnly.current && !readOnly) {
        focusEditorEdge(editor, { edge: 'end' });
      }

      prevReadOnly.current = readOnly;
    }, [autoFocusOnEditable, editor, readOnly]);

    return <PlateSlate id={id}>{aboveEditable}</PlateSlate>;
  }
);
PlateContent.displayName = 'PlateContent';

export { PlateContent };
