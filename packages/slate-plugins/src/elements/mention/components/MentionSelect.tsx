import React, { useEffect, useRef } from 'react';
import { classNamesFunction, styled } from '@uifabric/utilities';
import { getStyles } from 'elements/mention/components/MentionSelect.styles';
import {
  MentionSelectProps,
  MentionSelectStyleProps,
  MentionSelectStyles,
} from 'elements/mention/components/MentionSelect.types';
import { ReactEditor, useSlate } from 'slate-react';
import { PortalBody } from 'components';

const getClassNames = classNamesFunction<
  MentionSelectStyleProps,
  MentionSelectStyles
>();

export const MentionSelectBase = ({
  at,
  options,
  valueIndex,
  styles,
  onClickMention,
  ...props
}: MentionSelectProps) => {
  const classNames = getClassNames(styles);

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
            onMouseDown={(e) => {
              e.preventDefault();
              onClickMention(editor, option);
            }}
          >
            {option.value}
          </div>
        ))}
      </div>
    </PortalBody>
  );
};

export const MentionSelect: React.FC<MentionSelectProps> = styled<
  MentionSelectProps,
  MentionSelectStyleProps,
  MentionSelectStyles
>(MentionSelectBase, getStyles, undefined, {
  scope: 'MentionSelect',
});
