import { expect, it, mock } from 'bun:test';

import { fireEvent, render, screen, within } from '@testing-library/react';
import { createEditor } from 'platejs';
import { compare } from 'platejs/diff';
import React from 'react';

import { Diff } from './diff';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

it('keeps comparison identity and exact Unicode text across display granularities', async () => {
  const before = [
    paragraph('first'),
    paragraph('Moved 中 e\u0301\r\nsecond line'),
    paragraph('last'),
  ];
  const after = [
    paragraph('Moved 中 é!\r\nsecond line'),
    paragraph('first'),
    paragraph('last'),
  ];
  const editor = createEditor({ initialValue: before });
  const comparison = await compare({
    after,
    before,
    schema: editor.read.schema,
  });
  const { container } = render(<Diff comparison={comparison} locale="zh" />);

  expect(screen.getByText(/1 of 1 groups/)).not.toBeNull();
  expect(
    container.querySelector('[data-effect-kind="placement"]')
  ).not.toBeNull();
  expect(container.querySelector('[data-effect-kind="text"]')).not.toBeNull();
  expect(container.firstElementChild).toHaveAttribute(
    'data-comparison-id',
    comparison.id
  );

  fireEvent.change(screen.getByLabelText('Comparison text granularity'), {
    target: { value: 'grapheme' },
  });
  const textEffect = screen.getByLabelText('Text');
  const renderedSegments = Array.from(
    textEffect.querySelectorAll('[data-diff-segment="grapheme"]')
  ).map((element) => element.textContent);

  expect(renderedSegments).toEqual(['e\u0301', 'é', '!']);
  expect(renderedSegments.join('')).toBe('e\u0301é!');
  expect(container.firstElementChild).toHaveAttribute(
    'data-comparison-id',
    comparison.id
  );
});

it('filters semantic effects without changing group or effect totals', async () => {
  const before = [paragraph('Alpha'), paragraph('Beta'), paragraph('Gamma')];
  const after = [paragraph('Gamma!'), paragraph('Alpha'), paragraph('Beta')];
  const editor = createEditor({ initialValue: before });
  const comparison = await compare({
    after,
    before,
    schema: editor.read.schema,
  });
  const { container } = render(<Diff comparison={comparison} />);
  const totalGroups = comparison.changes.length;
  const totalEffects = comparison.changes.reduce(
    (total, change) => total + change.effects.length,
    0
  );

  fireEvent.change(screen.getByLabelText('Filter comparison effects'), {
    target: { value: 'text' },
  });

  const textGroups = comparison.changes.filter(({ effects }) =>
    effects.some(({ kind }) => kind === 'text')
  ).length;
  const textEffects = comparison.changes.reduce(
    (total, { effects }) =>
      total + effects.filter(({ kind }) => kind === 'text').length,
    0
  );

  expect(
    screen.getByText(
      `${textGroups} of ${totalGroups} groups · ${textEffects} of ${totalEffects} effects`
    )
  ).not.toBeNull();
  expect(container.querySelectorAll('[data-effect-kind="text"]')).toHaveLength(
    textEffects
  );
  expect(container.querySelector('[data-effect-kind="placement"]')).toBeNull();

  const activeChange = container.querySelector('[data-comparison-change]');
  expect(activeChange).not.toBeNull();
  expect(
    within(activeChange as HTMLElement).getByText(/Inferred/)
  ).toBeVisible();
});

it('filters branch contributions and resolves conflicts with bound identities', async () => {
  const base = [paragraph('Base')];
  const editor = createEditor({ initialValue: base });
  const comparison = await compare({
    base,
    local: [paragraph('Local')],
    remote: [paragraph('Remote')],
    schema: editor.read.schema,
  });
  const onResolutionsChange = mock();
  const { container } = render(
    <Diff comparison={comparison} onResolutionsChange={onResolutionsChange} />
  );
  const conflict = comparison.conflicts[0];

  expect(container.querySelectorAll('[data-comparison-conflict]')).toHaveLength(
    1
  );
  fireEvent.click(screen.getByRole('button', { name: 'Use remote' }));
  expect(onResolutionsChange).toHaveBeenLastCalledWith([
    {
      choice: 'remote',
      comparisonId: comparison.id,
      conflictId: conflict.id,
    },
  ]);

  fireEvent.change(screen.getByLabelText('Filter comparison branches'), {
    target: { value: 'remote' },
  });
  expect(container.querySelectorAll('[data-comparison-change]')).toHaveLength(
    comparison.changes.filter(({ branches }) => branches?.includes('remote'))
      .length
  );
  expect(
    container.querySelector('[data-comparison-branch="local"]')
  ).toBeNull();
});

it('includes required groups when selecting a filtered branch', async () => {
  const base = [paragraph('one'), paragraph('two')];
  const editor = createEditor({ initialValue: base });
  const comparison = await compare({
    base,
    local: [paragraph('one local'), paragraph('two')],
    remote: [paragraph('one'), paragraph('two remote')],
    schema: editor.read.schema,
  });
  const local = comparison.changes.find(({ branches }) =>
    branches?.includes('local')
  )!;
  const remote = comparison.changes.find(({ branches }) =>
    branches?.includes('remote')
  )!;
  const dependentComparison = {
    ...comparison,
    changes: comparison.changes.map((change) =>
      change.id === remote.id
        ? { ...change, requiredChangeIds: [local.id] }
        : change
    ),
  };
  const onSelectionChange = mock();

  render(
    <Diff
      comparison={dependentComparison}
      onSelectionChange={onSelectionChange}
    />
  );
  fireEvent.change(screen.getByLabelText('Filter comparison branches'), {
    target: { value: 'remote' },
  });
  fireEvent.click(
    screen.getByRole('button', { name: 'Select filtered comparison groups' })
  );

  expect(onSelectionChange).toHaveBeenLastCalledWith([local.id, remote.id]);
});
