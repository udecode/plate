import React from 'react';
import { Editable } from 'slate-react';

import { useEditableProps } from '../hooks/index';
import { PLATE_SCOPE, useEditorRef } from '../stores';
import { TEditableProps } from '../types/slate-react/TEditableProps';
import { EditorMethodsEffect } from './EditorMethodsEffect';
import { EditorRefEffect } from './EditorRefEffect';
import { EditorStateEffect } from './EditorStateEffect';
import { PlateSlate } from './PlateSlate';

export type PlateContentProps = TEditableProps & {
  /**
   * Renders the editable content.
   */
  renderEditable?: (editable: React.ReactElement) => React.ReactNode;
};

/**
 * Editable with plugins.
 *
 * - decorate prop
 * - DOM handler props
 * - readOnly prop
 * - renderAfterEditable
 * - renderBeforeEditable
 * - renderElement prop
 * - renderLeaf prop
 * - useHooks
 */
const PlateContent = React.forwardRef(
  ({ renderEditable, ...props }: PlateContentProps, ref) => {
    const { id = PLATE_SCOPE } = props;

    const editor = useEditorRef();
    const { plugins } = editor;

    const editableProps = useEditableProps(props);

    const editable = <Editable ref={ref} {...(editableProps as any)} />;

    let afterEditable: React.ReactNode = null;
    let beforeEditable: React.ReactNode = null;

    plugins.forEach((plugin) => {
      const { renderBeforeEditable, renderAfterEditable } = plugin;

      if (renderAfterEditable) {
        afterEditable = (
          <>
            {afterEditable}
            {renderAfterEditable(editableProps)}
          </>
        );
      }

      if (renderBeforeEditable) {
        beforeEditable = (
          <>
            {beforeEditable}
            {renderBeforeEditable(editableProps)}
          </>
        );
      }
    });

    let aboveEditable: React.ReactNode = (
      <>
        {beforeEditable}

        {renderEditable ? renderEditable(editable) : editable}

        <EditorMethodsEffect id={id} />
        <EditorStateEffect id={id} />
        <EditorRefEffect id={id} />

        {afterEditable}
      </>
    );

    plugins.forEach((plugin) => {
      const { renderAboveEditable } = plugin;

      if (renderAboveEditable)
        aboveEditable = renderAboveEditable({
          children: aboveEditable,
        }) as any;
    });

    return <PlateSlate id={id}>{aboveEditable}</PlateSlate>;
  }
);
PlateContent.displayName = 'PlateContent';

export { PlateContent };
