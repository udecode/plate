import * as React from 'react';
import { styled } from '@uifabric/utilities';
import { Transforms } from 'slate';
import { ReactEditor, useEditor } from 'slate-react';
import { ElementProps, getRootClassNames, NodeStyleProps } from '../../types';
import { getMediaEmbedElementStyles } from './MediaEmbedElement.styles';
import { MediaEmbedElementStyleSet } from './MediaEmbedElement.types';
import { MediaEmbedUrlInput } from './MediaEmbedUrlInput';

const getClassNames = getRootClassNames<
  NodeStyleProps,
  MediaEmbedElementStyleSet
>();

type Props = ElementProps<
  { url: string },
  NodeStyleProps,
  MediaEmbedElementStyleSet
>;

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
}: Props) => {
  const classNames = getClassNames(styles, {
    className,
    // Other style props
  });

  const editor = useEditor();
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
          />
        </div>

        <MediaEmbedUrlInput
          data-testid="MediaEmbedUrlInput"
          className={classNames.input}
          url={url}
          onChange={(val: string) => {
            const path = ReactEditor.findPath(editor, element);
            Transforms.setNodes(editor, { url: val }, { at: path });
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
  Props,
  NodeStyleProps,
  NonNullable<Props['styles']>
>(MediaEmbedElementBase, getMediaEmbedElementStyles, undefined, {
  scope: 'MediaEmbedElement',
});
