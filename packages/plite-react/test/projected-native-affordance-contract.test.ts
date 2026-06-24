import { describe, expect, it } from 'vitest';

import {
  getProjectedNativeAffordanceMatrix,
  type ProjectedNativeAffordanceStatus,
} from '../src/editable/projected-native-affordance';

describe('projected native affordance matrix', () => {
  it('classifies every native affordance without claiming blanket native parity', () => {
    const matrix = getProjectedNativeAffordanceMatrix();
    const expectedKeys = [
      'clipboard',
      'find',
      'ime',
      'mobileSelection',
      'screenReader',
      'spellcheck',
    ];

    expect(Object.keys(matrix).sort()).toEqual([...expectedKeys].sort());
    expect(matrix.clipboard.status).toBe('supported');

    for (const key of expectedKeys) {
      const entry = matrix[key as keyof typeof matrix];

      expect(
        ['degraded', 'supported', 'unsupported'].includes(
          entry.status satisfies ProjectedNativeAffordanceStatus
        )
      ).toBe(true);
      expect(entry.proof.length).toBeGreaterThan(20);
    }

    expect(
      Object.entries(matrix)
        .filter(([key]) => key !== 'clipboard')
        .map(([, entry]) => entry.status)
    ).not.toContain('supported');
  });
});
