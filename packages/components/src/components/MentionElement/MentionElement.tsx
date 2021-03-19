import * as React from 'react';
import { getHandler, MentionNodeData } from '@udecode/slate-plugins';
import { styled } from '@uifabric/utilities';
import { useFocused, useSelected } from 'slate-react';
import { getRootClassNames, NodeStyleSet } from '../../types';
import { getMentionElementStyles } from './MentionElement.styles';
import {
  MentionElementProps,
  MentionElementStyleProps,
} from './MentionElement.types';

const getClassNames = getRootClassNames<
  MentionElementStyleProps,
  NodeStyleSet
>();

/**
 *   MentionElement with no default styles.
 * [Use the `styles` API to add your own styles.](https://github.com/OfficeDev/office-ui-fabric-react/wiki/Component-Styling)
 */
export const MentionElementBase = ({
  attributes,
  children,
  element,
  prefix,
  className,
  styles,
  as: Tag = 'span',
  onClick,
  renderLabel = (mentionable: MentionNodeData) => mentionable.value,
}: MentionElementProps) => {
  const selected = useSelected();
  const focused = useFocused();

  const classNames = getClassNames(styles, {
    className,
    // Other style props
    selected,
    focused,
  });

  return (
    <Tag
      {...attributes}
      data-slate-value={element.value}
      className={classNames.root}
      contentEditable={false}
      onClick={getHandler(onClick, element)}
    >
      {prefix}
      {renderLabel(element)}
      {children}
    </Tag>
  );
};

/**
 * MentionElement
 */
export const MentionElement = styled<
  MentionElementProps,
  MentionElementStyleProps,
  NonNullable<MentionElementProps['styles']>
>(MentionElementBase, getMentionElementStyles, undefined, {
  scope: 'MentionElement',
});
