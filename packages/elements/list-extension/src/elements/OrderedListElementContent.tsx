import * as React from 'react';
import { ReactElement } from 'react';
import { useEventEditorId, useStoreEditorState } from '@udecode/plate-core';
import {
  getStyledNodeStyles,
  StyledElementProps,
} from '@udecode/plate-styled-components';
import { useAtom } from 'jotai';
import castArray from 'lodash/castArray';
import { CSSObject } from 'styled-components';
import { licSelectionState } from '../atoms/licSelection';
import { onMouseDown } from '../interaction/OnMouseDown';
import { isSelected } from '../queries/isSelected';

/**
 * StyledElement with no default styles.
 */
export const OrderedListElementContent = (
  props: StyledElementProps
): ReactElement => {
  const { attributes, children, nodeProps, className, styles, element } = props;
  const editor = useStoreEditorState(useEventEditorId('focus'));
  const [licSelection, setLicSelection] = useAtom(
    licSelectionState({ id: useEventEditorId('focus') as string })
  );

  const selected = editor && isSelected(editor, attributes.ref, licSelection);

  const rootStyles = castArray(styles?.root ?? []);
  const nodePropsStyles = nodeProps?.styles?.root?.css ?? [];

  const { root } = getStyledNodeStyles({
    ...nodeProps,
    styles: { root: [...rootStyles, ...nodePropsStyles] },
  });

  const styleProps: CSSObject = root.css.reduce((acc: CSSObject, a) => {
    if (typeof a === 'object') {
      return { ...acc, ...(a as Partial<React.CSSProperties>) };
    }
    return acc;
  }, {} as CSSObject);

  let textDecoration = '';

  if (element.strikethrough) {
    textDecoration = `line-through ${textDecoration}`;
  }
  if (element.underline) {
    textDecoration = `underline ${textDecoration}`;
  }
  return (
    <div
      style={{
        ...styleProps,
        display: 'flex',
      }}
      className={className}
    >
      {element.parentType === 'ol' && (
        <span
          style={{
            userSelect: 'none',
            msUserSelect: 'none',
            paddingRight: '4px',
            ...(element.color ? { color: element.color } : {}),
            ...(element.fontSize ? { fontSize: element.fontSize } : {}),
            ...(element.fontWeight ? { fontWeight: element.fontWeight } : {}),
            ...(element.fontFamily
              ? { fontFamily: element.fontFamily.label }
              : {}),
            ...(element.backgroundColor
              ? { backgroundColor: element.backgroundColor }
              : {}),
            ...(element.bold ? { fontWeight: 'bold' } : {}),
            ...(element.italic ? { fontStyle: 'italic' } : {}),
            ...(textDecoration ? { textDecoration } : {}),
            ...(selected ? { backgroundColor: '#b9d5ff' } : {}),
          }}
          contentEditable={false}
          onMouseDown={(ev) =>
            editor && onMouseDown(ev, editor, attributes, setLicSelection)
          }
        >
          {`${element?.order?.join('.')}.`}
        </span>
      )}
      <span style={{ display: 'inline-block' }} {...attributes} {...nodeProps}>
        {children}
      </span>
    </div>
  );
};
