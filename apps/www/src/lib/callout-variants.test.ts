import { describe, expect, it } from 'bun:test';

import {
  getCalloutVariant,
  getCalloutVariantClassName,
} from './callout-variants';

describe('callout variants', () => {
  it('maps legacy MDX callout types to rendered variants', () => {
    expect(getCalloutVariant({ type: 'warning' })).toBe('warning');
    expect(getCalloutVariant({ type: 'warn' })).toBe('warning');
    expect(getCalloutVariant({ type: 'note' })).toBe('info');
    expect(getCalloutVariant({ type: 'destructive' })).toBe('destructive');
    expect(getCalloutVariant({ type: 'success' })).toBe('success');
    expect(getCalloutVariant({ variant: 'default' })).toBe('default');
  });

  it('keeps type variants visually distinct', () => {
    expect(getCalloutVariantClassName('warning')).toContain('orange');
    expect(getCalloutVariantClassName('info')).toContain('blue');
    expect(getCalloutVariantClassName('destructive')).toContain('destructive');
    expect(getCalloutVariantClassName('default')).toBeNull();
  });
});
