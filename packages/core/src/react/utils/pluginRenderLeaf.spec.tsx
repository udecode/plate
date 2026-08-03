/// <reference types="@testing-library/jest-dom" />

import { property } from '@platejs/plite';
import React from 'react';

import { render } from '@testing-library/react';

import { defineBasePlugin } from '../../lib/plugin';
import { createPlateEditor } from '../editor/withPlate';
import { pluginRenderLeaf } from './pluginRenderLeaf';

it('uses a plain render.as fast path for simple leaf plugins', () => {
  const testPlugin = defineBasePlugin('test', {
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: {
      as: 'strong',
    },
  });
  const editor = createPlateEditor({
    navigationFeedback: false,
    plugins: [testPlugin],
  });
  const renderLeaf = pluginRenderLeaf(editor, testPlugin as any);
  const TestComponent = () =>
    renderLeaf({
      attributes: {
        'data-plite-leaf': true,
        className: 'from-plite',
      } as any,
      children: 'test content',
      leaf: { test: true, text: 'test content' } as any,
      leafPosition: { end: 0, start: 12 } as any,
      text: { test: true, text: 'test content' } as any,
    } as any);

  const { container } = render(<TestComponent />);

  const leaf = container.querySelector('strong');

  expect(leaf).not.toBeNull();
  expect(leaf).toHaveClass('plite-test');
  expect(leaf).toHaveClass('from-plite');
  expect(leaf).toHaveAttribute('data-plite-leaf', 'true');
  expect(leaf).toHaveTextContent('test content');
});

it('renders simple hard-affinity leaves without spacers when inactive', () => {
  const testPlugin = defineBasePlugin('test', {
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: {
      as: 'code',
    },
    rules: {
      selection: {
        affinity: 'hard',
      },
    },
  });
  const editor = createPlateEditor({
    navigationFeedback: false,
    plugins: [testPlugin],
  });
  const renderLeaf = pluginRenderLeaf(editor, testPlugin as any);
  const text = { test: true, text: 'test content' } as any;
  const TestComponent = () =>
    renderLeaf({
      children: 'test content',
      leaf: text,
      leafPosition: { end: 0, start: 12 } as any,
      text,
    } as any);

  const { container } = render(<TestComponent />);
  const leaf = container.querySelector('code');
  const spacers = container.querySelectorAll('span[contenteditable="false"]');

  expect(leaf).not.toBeNull();
  expect(leaf).toHaveClass('plite-test');
  expect(leaf).toHaveTextContent('test content');
  expect(spacers).toHaveLength(0);
});

it('renders simple directional-affinity leaves without PlateLeaf fallback', () => {
  const testPlugin = defineBasePlugin('test', {
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: {
      as: 's',
    },
    rules: {
      selection: {
        affinity: 'directional',
      },
    },
  });
  const editor = createPlateEditor({
    plugins: [testPlugin],
  });
  const renderLeaf = pluginRenderLeaf(editor, testPlugin as any);
  const TestComponent = () =>
    renderLeaf({
      children: 'test content',
      leaf: { test: true, text: 'test content' } as any,
      leafPosition: { end: 0, start: 12 } as any,
      text: { test: true, text: 'test content' } as any,
    } as any);

  const { container } = render(<TestComponent />);

  const leaf = container.querySelector('s');

  expect(leaf).not.toBeNull();
  expect(leaf).toHaveClass('plite-test');
  expect(leaf).toHaveTextContent('test content');
});

it('renders boundary spacers only for the active hard-affinity edge', () => {
  const testPlugin = defineBasePlugin('test', {
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: {
      as: 'code',
    },
    rules: {
      selection: {
        affinity: 'hard',
      },
    },
  });
  const editor = createPlateEditor({
    navigationFeedback: false,
    plugins: [testPlugin],
    selection: {
      kind: 'text',
      anchor: { offset: 12, path: [0, 0] },
      focus: { offset: 12, path: [0, 0] },
    } as any,
    initialValue: [
      {
        children: [{ test: true, text: 'test content' }],
        type: 'paragraph',
      },
    ] as any,
  });
  const renderLeaf = pluginRenderLeaf(editor, testPlugin as any);
  const text = editor.read.children()[0].children[0] as any;
  const TestComponent = () =>
    renderLeaf({
      children: 'test content',
      leaf: text,
      leafPosition: { end: 0, start: 12 } as any,
      text,
    } as any);

  const { container } = render(<TestComponent />);

  const leaf = container.querySelector('code');
  const spacers = container.querySelectorAll('span[contenteditable="false"]');

  expect(leaf).not.toBeNull();
  expect(leaf).toHaveClass('plite-test');
  expect(leaf).toHaveTextContent('test content');
  expect(spacers).toHaveLength(2);
});
