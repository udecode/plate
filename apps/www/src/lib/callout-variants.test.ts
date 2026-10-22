import { describe, expect, it } from 'bun:test';

import { getCalloutVariant } from './callout-variants';

describe('callout variants', () => {
  it('maps legacy MDX callout types to rendered variants', () => {
    expect(getCalloutVariant({ type: 'warning' })).toBe('warning');
    expect(getCalloutVariant({ type: 'warn' })).toBe('warning');
    expect(getCalloutVariant({ type: 'note' })).toBe('info');
    expect(getCalloutVariant({ type: 'destructive' })).toBe('destructive');
    expect(getCalloutVariant({ type: 'success' })).toBe('success');
    expect(getCalloutVariant({ variant: 'default' })).toBe('default');
  });
});
