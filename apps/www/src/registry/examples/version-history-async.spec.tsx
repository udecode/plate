import { expect, it, spyOn } from 'bun:test';

import { render, waitFor } from '@testing-library/react';
import { createEditor, type Value } from 'platejs';
import React from 'react';

import { VersionDiff } from './version-history-demo';

const document = (): Value =>
  Array.from({ length: 1000 }, (_, index) => ({
    children: [{ text: `Unique paragraph ${index}` }],
    type: 'paragraph',
  }));

it('aborts an obsolete version comparison and never publishes its result', async () => {
  const before = document();
  const first = before.map((node, index) =>
    index === 0
      ? { children: [{ text: 'First request' }], type: 'paragraph' }
      : node
  );
  const second = before.map((node, index) =>
    index === before.length - 1
      ? { children: [{ text: 'Second request' }], type: 'paragraph' }
      : node
  );
  const abort = spyOn(AbortController.prototype, 'abort');
  const { schema } = createEditor({ initialValue: before }).read;
  const view = render(
    <VersionDiff after={first} before={before} schema={schema} />
  );

  view.rerender(<VersionDiff after={second} before={before} schema={schema} />);

  expect(abort).toHaveBeenCalled();
  await waitFor(
    () =>
      expect(
        view.container.querySelector('[data-comparison-id]')
      ).not.toBeNull(),
    { timeout: 8000 }
  );
  expect(view.container.textContent).toContain('Second request');
  expect(view.container.textContent).not.toContain('First request');
}, 12_000);
