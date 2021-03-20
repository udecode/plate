import * as React from 'react';
import { useEffect, useRef } from 'react';
import {
  getPreventDefaultHandler,
  MentionNodeData,
  MentionSelectProps,
  MentionSelectStyleSet,
} from '@udecode/slate-plugins';
import { styled } from '@uifabric/utilities';
import { ReactEditor, useSlate } from 'slate-react';
import { getRootClassNames } from '../../types';
import { PortalBody } from '../PortalBody/PortalBody';
import { NodeStyleProps } from '../StyledNode/StyledNode.types';
import { getMentionSelectStyles } from './MentionSelect.styles';

const getClassNames = getRootClassNames<
  NodeStyleProps,
  MentionSelectStyleSet
>();

export const MentionSelectBase = ({
  className,
  styles,
  at,
  options,
  valueIndex,
  onClickMention,
  renderLabel = (mentionable: MentionNodeData) => mentionable.value,
  ...props
}: MentionSelectProps) => {
  const classNames = getClassNames(styles, {
    className,
  });

  const ref: any = useRef();
  const editor = useSlate();

  useEffect(() => {
    if (at && options.length > 0) {
      const el = ref.current;
      const domRange = ReactEditor.toDOMRange(editor, at);
      const rect = domRange.getBoundingClientRect();
      if (el) {
        el.style.top = `${rect.top + window.pageYOffset + 24}px`;
        el.style.left = `${rect.left + window.pageXOffset}px`;
      }
    }
  }, [options.length, editor, at]);

  if (!at || !options.length) {
    return null;
  }

  return (
    <PortalBody>
      <div ref={ref} className={classNames.root} {...props}>
        {options.map((option, i) => (
          <div
            key={`${i}${option.value}`}
            className={
              i === valueIndex
                ? classNames.mentionItemSelected
                : classNames.mentionItem
            }
            onMouseDown={getPreventDefaultHandler(
              onClickMention,
              editor,
              option
            )}
          >
            {renderLabel(option)}
          </div>
        ))}
      </div>
    </PortalBody>
  );
};

export const MentionSelect = styled<
  MentionSelectProps,
  NodeStyleProps,
  NonNullable<MentionSelectProps['styles']>
>(MentionSelectBase, getMentionSelectStyles, undefined, {
  scope: 'MentionSelect',
});
