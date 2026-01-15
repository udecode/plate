import * as React from 'react';

import type { TDateElement } from 'platejs';
import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

/**
 * DOCX-compatible date component.
 * Renders the date as plain text inline.
 */
export function DateElementStaticDocx(props: SlateElementProps<TDateElement>) {
  const { element } = props;

  const getDateText = () => {
    if (!element.date) return 'Pick a date';

    const today = new Date();
    const elementDate = new Date(element.date);
    const isToday =
      elementDate.getDate() === today.getDate() &&
      elementDate.getMonth() === today.getMonth() &&
      elementDate.getFullYear() === today.getFullYear();

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = elementDate.toDateString() === yesterday.toDateString();

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const isTomorrow = elementDate.toDateString() === tomorrow.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    if (isTomorrow) return 'Tomorrow';

    return elementDate.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <SlateElement {...props} as="span">
      <span
        style={{
          backgroundColor: '#f4f4f5',
          borderRadius: '2px',
          padding: '0 4px',
        }}
      >
        {getDateText()}
      </span>
      {props.children}
    </SlateElement>
  );
}
