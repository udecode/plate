import * as React from 'react';
import { setNodes } from '@udecode/slate-plugins-common';
import { TElement, useEditorRef } from '@udecode/slate-plugins-core';
import { EsxcalidrawData } from '@udecode/slate-plugins-excalidraw';
import { ClassName, getRootClassNames } from '@udecode/slate-plugins-ui-fluent';
import { styled } from '@uifabric/utilities';
import { ReactEditor } from 'slate-react';
import { getExcalidrawElementStyles } from './ExcalidrawElement.styles';
import {
  ExcalidrawElementProps,
  ExcalidrawElementStyleSet,
} from './ExcalidrawElement.types';
import { ExcalidrawUrlInput } from './ExcalidrawUrlInput';

const getClassNames = getRootClassNames<ClassName, ExcalidrawElementStyleSet>();

/**
 * ExcalidrawElement with no default styles.
 * [Use the `styles` API to add your own styles.](https://github.com/OfficeDev/office-ui-fabric-react/wiki/Component-Styling)
 */
export const ExcalidrawElementBase = ({
  attributes,
  children,
  element,
  className,
  styles,
  nodeProps,
}: ExcalidrawElementProps) => {
  const classNames = getClassNames(styles, {
    className,
    // Other style props
  });

  const editor = useEditorRef();
  const { url } = element;

  return (
    <div {...attributes} className={classNames.root}>
      <div contentEditable={false}>
        <div className={classNames.iframeWrapper}>
          <iframe
            className={classNames.iframe}
            title="embed"
            src={`${url}?title=0&byline=0&portrait=0`}
            frameBorder="0"
            {...nodeProps}
          />
        </div>

        <ExcalidrawUrlInput
          data-testid="ExcalidrawUrlInput"
          className={classNames.input}
          url={url}
          onChange={(val: string) => {
            const path = ReactEditor.findPath(editor, element);
            setNodes<TElement<ExcalidrawNodeData>>(
              editor,
              { url: val },
              { at: path }
            );
          }}
        />
      </div>
      {children}
    </div>
  );
};

/**
 * MediaEmbedElement
 */
export const ExcalidrawElement = styled<
  ExcalidrawElementProps,
  ClassName,
  ExcalidrawElementStyleSet
>(ExcalidrawElementBase, getExcalidrawElementStyles, undefined, {
  scope: 'ExcalidrawElement',
});
