import React, { useRef } from 'react';

import { useComposedRef } from '@udecode/react-utils';
import clsx from 'clsx';

import type { EditableProps } from '../../lib/types/EditableProps';

import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import { useEditableProps } from '../hooks';
import {
  isPlateRuntimeEditor,
  type PlateRuntimeContentProps,
  PlateRuntimeContent,
  type PlateRuntimeEditor,
} from '../editor/createPlateRuntimeEditor';
import type { PlateEditor } from '../editor/PlateEditor';
import { Editable } from '../slate-react';
import {
  type PlateStoreState,
  useEditorReadOnly,
  useEditorRef,
} from '../stores';
import {
  PlateContentEffects,
  PlateContentStateEffect,
} from './PlateContentEffects';
import { EditorMethodsEffect } from './EditorMethodsEffect';
import { Plite } from './Plite';

type LegacyEditableComponentProps = React.ComponentProps<typeof Editable>;
type RuntimeEditableProps = NonNullable<
  PlateRuntimeContentProps['editableProps']
>;

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
  readOnly,
  storeReadOnly,
}: {
  disabled?: boolean;
  readOnly?: boolean;
  storeReadOnly: boolean;
}) => (disabled ? true : (readOnly ?? storeReadOnly));

const getRuntimeEditableProps = ({
  disabled,
  renderChunk: _renderChunk,
  renderEditable,
  ...props
}: PlateContentProps): RuntimeEditableProps =>
  ({
    ...props,
    'aria-disabled': disabled,
    className: clsx(
      'plite-editor',
      'ignore-click-outside/toolbar',
      props.className
    ),
    renderEditable,
  }) as unknown as RuntimeEditableProps;

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

    const storeReadOnly = useEditorReadOnly();
    const readOnly = getPlateContentReadOnly({
      disabled: props.disabled,
      readOnly: readOnlyProp,
      storeReadOnly,
    });

    // Can't be in useLayoutEffect for the first render
    editor.dom.readOnly = readOnly;

    if (!editor) {
      throw new Error(
        'Editor not found. Please ensure that PlateContent is rendered below Plate.'
      );
    }

    if (isPlateRuntimeEditor(editor)) {
      return (
        <PlateRuntimeContentBranch
          {...props}
          ref={ref}
          autoFocusOnEditable={autoFocusOnEditable}
          editor={editor}
          readOnly={readOnly}
          renderEditable={renderEditable}
        />
      );
    }

    return (
      <PlateLegacyContentBranch
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

const PlateLegacyContentBranch = React.forwardRef<
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

    // Don't render if editor is not ready (e.g., async value still loading)
    if (!editor.children || editor.children.length === 0) {
      return null;
    }

    const editable = (
      <Editable
        ref={combinedRef}
        {...(editableProps as unknown as LegacyEditableComponentProps)}
      />
    );

    let afterEditable: React.ReactNode = null;
    let beforeEditable: React.ReactNode = null;

    editor.meta.pluginCache.render.beforeEditable.forEach((key) => {
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

    editor.meta.pluginCache.render.afterEditable.forEach((key) => {
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

        <PlateContentEffects id={id} editableRef={editableRef} />
      </>
    );

    editor.meta.pluginCache.render.aboveEditable.forEach((key) => {
      const plugin = editor.getPlugin({ key });
      if (isEditOnly(plateReadOnly, plugin, 'render')) return;

      const AboveEditable = plugin.render.aboveEditable!;

      aboveEditable = <AboveEditable>{aboveEditable}</AboveEditable>;
    });

    return (
      <Plite id={id}>
        <PlateContentStateEffect
          id={id}
          disabled={props.disabled}
          readOnly={props.readOnly}
          autoFocusOnEditable={autoFocusOnEditable}
          editor={editor}
        />

        {beforeEditable}
        {aboveEditable}
        {afterEditable}
      </Plite>
    );
  }
);
PlateLegacyContentBranch.displayName = 'PlateLegacyContentBranch';

const PlateRuntimeContentBranch = React.forwardRef<
  HTMLDivElement,
  PlateContentProps & {
    editor: PlateRuntimeEditor;
    readOnly: boolean;
  }
>(
  (
    {
      autoFocusOnEditable,
      disabled,
      editor,
      readOnly,
      renderEditable,
      ...props
    },
    _ref
  ) => {
    const { id } = props;

    const editableProps = getRuntimeEditableProps({
      ...props,
      disabled,
      renderEditable,
    });

    return (
      <>
        <PlateRuntimeContent
          editor={editor}
          readOnly={readOnly}
          editableProps={editableProps}
        />
        <PlateContentStateEffect
          id={id}
          disabled={disabled}
          readOnly={readOnly}
          autoFocusOnEditable={autoFocusOnEditable}
          editor={editor}
        />
        <EditorMethodsEffect id={id} />
      </>
    );
  }
);
PlateRuntimeContentBranch.displayName = 'PlateRuntimeContentBranch';

export { PlateContent };
