/// <reference types="@testing-library/jest-dom" />

import { act, render, waitFor } from '@testing-library/react';
import React from 'react';

import { Plate } from '../../components/Plate';
import { PlateContent } from '../../components/PlateContent';
import { createEditor } from '../../editor';
import { ParagraphPlugin } from '../../plugins/paragraph/ParagraphPlugin';
import { MentionInputPlugin, MentionPlugin } from './MentionPlugin';

describe('MentionPlugin', () => {
  it('publishes a semantic trigger replacement to the mounted React tree', async () => {
    const MentionInput = ({ children }: React.PropsWithChildren) => (
      <span data-testid="mention-input">{children}</span>
    );
    const editor = createEditor({
      plugins: [
        ParagraphPlugin,
        MentionPlugin,
        MentionInputPlugin.configure({ component: MentionInput }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'Mention' }], type: 'paragraph' }],
    });
    const rendered = render(
      <Plate editor={editor}>
        <PlateContent />
      </Plate>
    );

    const editable = rendered.container.querySelector<HTMLElement>(
      '[contenteditable="true"]'
    );
    const text = rendered.container.querySelector(
      '[data-plite-string]'
    )?.firstChild;

    expect(editable).not.toBeNull();
    expect(text).toBeInstanceOf(Text);
    const beforeInput = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      data: '@',
      inputType: 'insertText',
    });

    await act(async () => {
      editable?.focus();
      document.getSelection()?.setBaseAndExtent(text!, 0, text!, 0);
      editable?.dispatchEvent(beforeInput);
    });

    await waitFor(() => {
      expect(rendered.getByTestId('mention-input')).toBeInTheDocument();
    });
    expect(beforeInput.defaultPrevented).toBe(true);
  });
});
