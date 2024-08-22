import React, { useRef } from 'react';

import type { TEditableProps } from '@udecode/slate-react';

import { useComposedRef } from '@udecode/react-utils';
import { Editable } from 'slate-react';

import { useEditableProps } from '../hooks';
import { type PlateStoreState, useEditorRef } from '../stores';
import { EditorHotkeysEffect } from './EditorHotkeysEffect';
import { EditorMethodsEffect } from './EditorMethodsEffect';
import { EditorRefEffect } from './EditorRefEffect';
import { EditorStateEffect } from './EditorStateEffect';
import { PlateControllerEffect } from './PlateControllerEffect';
import { PlateSlate } from './PlateSlate';

export type PlateContentProps = {
  decorate?: PlateStoreState['decorate'];
  /** R enders the editable content. */
  renderEditable?: (editable: React.ReactElement) => React.ReactNode;
} & Omit<TEditableProps, 'decorate'>;

/**
 * Editable with plugins.
 *
 * - Decorate prop
 * - DOM handler props
 * - ReadOnly prop
 * - RenderAfterEditable
 * - RenderBeforeEditable
 * - RenderElement prop
 * - RenderLeaf prop
 * - UseHooks
 */
const PlateContent = React.forwardRef(
  ({ renderEditable, ...props }: PlateContentProps, ref) => {
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
        renderAfterEditable: RenderAfterEditable,
        renderBeforeEditable: RenderBeforeEditable,
      } = plugin;

      if (RenderAfterEditable) {
        afterEditable = (
          <>
            {afterEditable}
            <RenderAfterEditable {...editableProps} />
          </>
        );
      }
      if (RenderBeforeEditable) {
        beforeEditable = (
          <>
            {beforeEditable}
            <RenderBeforeEditable {...editableProps} />
          </>
        );
      }
    });

    let aboveEditable: React.ReactNode = (
      <>
        {beforeEditable}

        {renderEditable ? renderEditable(editable) : editable}

        <EditorMethodsEffect id={id} />
        <EditorHotkeysEffect editableRef={editableRef} id={id} />
        <EditorStateEffect id={id} />
        <EditorRefEffect id={id} />
        <PlateControllerEffect id={id} />

        {afterEditable}
      </>
    );

    editor.pluginList.forEach((plugin) => {
      const { renderAboveEditable: RenderAboveEditable } = plugin;

      if (RenderAboveEditable)
        aboveEditable = (
          <RenderAboveEditable>{aboveEditable}</RenderAboveEditable>
        );
    });

    return <PlateSlate id={id}>{aboveEditable}</PlateSlate>;
  }
);
PlateContent.displayName = 'PlateContent';

export { PlateContent };
