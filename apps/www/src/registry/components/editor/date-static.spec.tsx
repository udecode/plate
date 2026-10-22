import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  setSystemTime,
} from 'bun:test';

import { render } from '@testing-library/react';
import type { DateElement } from 'platejs/date';
import * as actualStatic from 'platejs/static';
import * as React from 'react';

mock.module('platejs/static', () => ({
  ...actualStatic,
  EditorElement: ({ children }: React.ComponentProps<'span'>) => (
    <span>{children}</span>
  ),
}));

const { DateElementStatic } = await import(
  `./date-static?test=${Math.random().toString(36).slice(2)}`
);

// Bun tests run in UTC when TZ is unset, and deleting TZ stops Bun from
// applying a later change, so restore a value instead.
const originalTimeZone = process.env.TZ ?? 'UTC';

const renderLabel = (value: string) =>
  render(
    <DateElementStatic
      attributes={{}}
      element={
        {
          children: [{ text: '' }],
          type: 'date',
          value,
        } satisfies DateElement
      }
    >
      {null}
    </DateElementStatic>
  ).container.textContent;

describe('DateElementStatic', () => {
  beforeEach(() => {
    setSystemTime(new Date(2026, 2, 23, 9));
  });

  afterEach(() => {
    setSystemTime();
    process.env.TZ = originalTimeZone;
  });

  afterAll(() => {
    mock.restore();
  });

  it('prints the full date, never a relative word', () => {
    expect(renderLabel('2026-03-23')).toBe('March 23, 2026');
  });

  it('prints the stored day in every host zone', () => {
    process.env.TZ = 'Pacific/Kiritimati';
    expect(renderLabel('2026-03-23')).toBe('March 23, 2026');

    process.env.TZ = 'Etc/GMT+12';
    expect(renderLabel('2026-03-23')).toBe('March 23, 2026');
  });

  it('renders authored text as written', () => {
    expect(renderLabel('sometime next week')).toBe('sometime next week');
  });
});
