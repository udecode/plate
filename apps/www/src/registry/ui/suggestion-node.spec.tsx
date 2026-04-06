import * as React from 'react';

import { render } from '@testing-library/react';
import { afterAll, describe, expect, it, mock } from 'bun:test';
import { KEYS } from 'platejs';

mock.module('lucide-react', () => ({
  CornerDownLeftIcon: (props: React.ComponentProps<'svg'>) => (
    <svg {...props} />
  ),
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

import {
  getBlockSuggestionWrapperClassName,
  SuggestionLineBreakAnchor,
} from './suggestion-node';

describe('SuggestionLineBreakAnchor', () => {
  afterAll(() => {
    mock.restore();
  });

  it('anchors line-break icons to a local wrapper when children render a list', () => {
    const { container } = render(
      <SuggestionLineBreakAnchor className="bg-emerald-100 text-emerald-700">
        <ul>
          <li>Generate content</li>
        </ul>
      </SuggestionLineBreakAnchor>
    );

    const anchor = container.firstElementChild as HTMLElement | null;
    const icon = container.querySelector('svg');
    const iconBadge = icon?.closest('span') as HTMLElement | null;

    expect(anchor).not.toBeNull();
    expect(anchor?.classList.contains('inline-flex')).toBe(true);
    expect(anchor?.className.includes('bg-emerald-100')).toBe(false);
    expect(iconBadge?.parentElement).toBe(anchor);
    expect(iconBadge?.className.includes('bg-emerald-100')).toBe(true);
    expect(iconBadge?.className.includes('h-[calc(1lh+2px)]')).toBe(true);
    expect(iconBadge?.className.includes('w-[1lh]')).toBe(true);
    expect(anchor?.querySelector('ul')).not.toBeNull();
  });

  it('keeps column-group block suggestions in a flex wrapper', () => {
    const className = getBlockSuggestionWrapperClassName({
      elementType: KEYS.columnGroup,
      isActive: false,
      isHover: false,
      isInsert: false,
      isRemove: true,
    });

    expect(className.includes('flex')).toBe(true);
    expect(className.includes('size-full')).toBe(true);
    expect(className.includes('bg-red-100')).toBe(true);
  });
});
