/// <reference types="@testing-library/jest-dom" />

import { property } from '@platejs/plite';
import React from 'react';

import { render } from '@testing-library/react';

import { createBasePlugin } from '../../lib/plugin';
import { createPlateEditor } from '../editor/withPlate';
import { pluginRenderText } from './pluginRenderText';

it('uses a plain render.as fast path for simple text plugins', () => {
  const testPlugin = createBasePlugin({
    key: 'test',
    type: 'test',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
    render: { isDecoration: false, as: 'strong' },
  });
  const editor = createPlateEditor({
    navigationFeedback: false,
    plugins: [testPlugin],
  });
  const renderText = pluginRenderText(editor, testPlugin as any);
  const TestComponent = () =>
    renderText({
      attributes: {
        'data-plite-node': 'text',
        className: 'from-plite',
      } as any,
      children: 'test content',
      text: { test: true, text: 'test content' } as any,
    } as any);

  const { container } = render(<TestComponent />);

  const text = container.querySelector('strong');

  expect(text).not.toBeNull();
  expect(text).toHaveClass('plite-test');
  expect(text).toHaveClass('from-plite');
  expect(text).toHaveAttribute('data-plite-node', 'text');
  expect(text).toHaveTextContent('test content');
});
