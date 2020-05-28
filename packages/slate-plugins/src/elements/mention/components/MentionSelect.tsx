import React, { useEffect, useRef } from 'react';
import { classNamesFunction, styled } from '@uifabric/utilities';
import { getPreventDefaultHandler } from 'common/utils';
import {
  MentionSelectProps,
  MentionSelectStyleProps,
  MentionSelectStyles,
} from 'elements/mention/components/MentionSelect.types';
import { ReactEditor, useSlate } from 'slate-react';
import { PortalBody } from 'components';
import { getMentionSelectStyles } from './MentionSelect.styles';

const getClassNames = classNamesFunction<
  MentionSelectStyleProps,
  MentionSelectStyles
>();

export const MentionSelectBase = ({
  className,
  styles,
  at,
  options,
  valueIndex,
  onClickMention,
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
            {option.value}
          </div>
        ))}
      </div>
    </PortalBody>
  );
};

export const MentionSelect = styled<
  MentionSelectProps,
  MentionSelectStyleProps,
  MentionSelectStyles
>(MentionSelectBase, getMentionSelectStyles, undefined, {
  scope: 'MentionSelect',
});
