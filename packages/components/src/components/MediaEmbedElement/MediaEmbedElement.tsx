import * as React from 'react';
import { useEditorStatic } from '@udecode/slate-plugins';
import { styled } from '@uifabric/utilities';
import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { getRootClassNames } from '../../types';
import { StyledElementProps } from '../StyledElement/StyledElement.types';
import { NodeStyleProps } from '../StyledNode/StyledNode.types';
import { getMediaEmbedElementStyles } from './MediaEmbedElement.styles';
import { MediaEmbedElementStyleSet } from './MediaEmbedElement.types';
import { MediaEmbedUrlInput } from './MediaEmbedUrlInput';

const getClassNames = getRootClassNames<
  NodeStyleProps,
  MediaEmbedElementStyleSet
>();

type Props = StyledElementProps<
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
  nodeProps,
}: Props) => {
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
  Props,
  NodeStyleProps,
  NonNullable<Props['styles']>
>(MediaEmbedElementBase, getMediaEmbedElementStyles, undefined, {
  scope: 'MediaEmbedElement',
});
