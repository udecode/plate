import * as React from 'react';

import { describe, expect, it } from 'bun:test';
import { render } from '@testing-library/react';
import type { TSuggestionText } from 'platejs';

import { SuggestionLeafDocx } from './suggestion-node-docx';

describe('SuggestionLeafDocx', () => {
  it('should render as span element', () => {
    const mockProps = {
      attributes: { 'data-slate-leaf': true },
      children: 'test content',
      editor: {} as any,
      leaf: {
        text: 'test content',
        suggestion: true,
      } as TSuggestionText,
      text: {
        text: 'test content',
        suggestion: true,
      } as TSuggestionText,
    };

    const { container } = render(<SuggestionLeafDocx {...mockProps} />);
    const span = container.querySelector('span');

    expect(span).not.toBeNull();
    expect(span?.textContent).toBe('test content');
  });

  it('should not render as ins or del tags', () => {
    const mockProps = {
      attributes: { 'data-slate-leaf': true },
      children: 'suggestion text',
      editor: {} as any,
      leaf: {
        text: 'suggestion text',
        suggestion: true,
        suggestionDeletion: true,
      } as TSuggestionText,
      text: {
        text: 'suggestion text',
        suggestion: true,
        suggestionDeletion: true,
      } as TSuggestionText,
    };

    const { container } = render(<SuggestionLeafDocx {...mockProps} />);

    // Should NOT use <ins> or <del> tags
    expect(container.querySelector('ins')).toBeNull();
    expect(container.querySelector('del')).toBeNull();

    // Should use <span> instead
    expect(container.querySelector('span')).not.toBeNull();
  });

  it('should preserve children content', () => {
    const mockProps = {
      attributes: { 'data-slate-leaf': true },
      children: 'preserved content',
      editor: {} as any,
      leaf: {
        text: 'preserved content',
      } as TSuggestionText,
      text: {
        text: 'preserved content',
      } as TSuggestionText,
    };

    const { container } = render(<SuggestionLeafDocx {...mockProps} />);

    expect(container.textContent).toBe('preserved content');
  });

  it('should handle empty content', () => {
    const mockProps = {
      attributes: { 'data-slate-leaf': true },
      children: '',
      editor: {} as any,
      leaf: {
        text: '',
      } as TSuggestionText,
      text: {
        text: '',
      } as TSuggestionText,
    };

    const { container } = render(<SuggestionLeafDocx {...mockProps} />);
    const span = container.querySelector('span');

    expect(span).not.toBeNull();
    expect(span?.textContent).toBe('');
  });

  it('should pass through attributes', () => {
    const mockProps = {
      attributes: {
        'data-slate-leaf': true,
        'data-testid': 'custom-attribute',
      },
      children: 'test',
      editor: {} as any,
      leaf: {
        text: 'test',
      } as TSuggestionText,
      text: {
        text: 'test',
      } as TSuggestionText,
    };

    const { container } = render(<SuggestionLeafDocx {...mockProps} />);
    const span = container.querySelector('span');

    expect(span?.getAttribute('data-slate-leaf')).toBe('true');
    expect(span?.getAttribute('data-testid')).toBe('custom-attribute');
  });
});
