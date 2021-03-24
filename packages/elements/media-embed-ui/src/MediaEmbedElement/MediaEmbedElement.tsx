import * as React from 'react';
import { useEditorStatic } from '@udecode/slate-plugins-core';
import { ClassName, getRootClassNames } from '@udecode/slate-plugins-ui-fluent';
import { styled } from '@uifabric/utilities';
import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { getMediaEmbedElementStyles } from './MediaEmbedElement.styles';
import {
  MediaEmbedElementProps,
  MediaEmbedElementStyleSet,
} from './MediaEmbedElement.types';
import { MediaEmbedUrlInput } from './MediaEmbedUrlInput';

const getClassNames = getRootClassNames<ClassName, MediaEmbedElementStyleSet>();

/**
 * MediaEmbedElement with no default styles.
 * [Use the `styles` API to add your own styles.](https://github.com/OfficeDev/office-ui-fabric-react/wiki/Component-Styling)
 */
export const MediaEmbedElementBase = ({
  attributes,
  children,
  element,
  className,
  styles,
  nodeProps,
}: MediaEmbedElementProps) => {
  const classNames = getClassNames(styles, {
    className,
    // Other style props
  });

  const editor = useEditorStatic();
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

        <MediaEmbedUrlInput
          data-testid="MediaEmbedUrlInput"
          className={classNames.input}
          url={url}
          onChange={(val: string) => {
            const path = ReactEditor.findPath(editor, element);
            Transforms.setNodes(editor, { url: val } as any, { at: path });
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
export const MediaEmbedElement = styled<
  MediaEmbedElementProps,
  ClassName,
  MediaEmbedElementStyleSet
>(MediaEmbedElementBase, getMediaEmbedElementStyles, undefined, {
  scope: 'MediaEmbedElement',
});
