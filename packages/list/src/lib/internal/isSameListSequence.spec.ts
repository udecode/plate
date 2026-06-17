import { KEYS } from 'platejs';

import {
  getListSequenceSiblingOptions,
  isSameListSequence,
} from './isSameListSequence';

const createListNode = (
  type: string,
  options: { indent?: number; listStyleType?: string } = {}
) => {
  const { indent = 1 } = options;
  const listStyleType =
    'listStyleType' in options ? options.listStyleType : 'decimal';

  return {
    children: [{ text: '' }],
    [KEYS.indent]: indent,
    [KEYS.listType]: listStyleType,
    type,
  };
};

describe('isSameListSequence', () => {
  it('falls back to raw heading keys without editor getType', () => {
    expect(
      isSameListSequence(
        {} as any,
        createListNode(KEYS.h1) as any,
        createListNode(KEYS.p) as any
      )
    ).toBe(false);
  });

  it('uses configured heading node types when editor getType is available', () => {
    const editor = {
      getType: (key: string) => (key === KEYS.h1 ? 'heading-one' : key),
    };

    expect(
      isSameListSequence(
        editor as any,
        createListNode('heading-one') as any,
        createListNode(KEYS.p) as any
      )
    ).toBe(false);
  });

  it('breaks lookup at same-indent heading and non-heading boundaries', () => {
    const options = getListSequenceSiblingOptions({} as any);

    expect(
      options.breakQuery?.(
        createListNode(KEYS.h1) as any,
        createListNode(KEYS.p) as any
      )
    ).toBe(true);
    expect(
      options.query?.(
        createListNode(KEYS.h1) as any,
        createListNode(KEYS.p) as any
      )
    ).toBe(false);
  });

  it('does not break lookup at nested heading and non-heading boundaries', () => {
    const options = getListSequenceSiblingOptions({} as any);

    expect(
      options.breakQuery?.(
        createListNode(KEYS.h1, { indent: 2 }) as any,
        createListNode(KEYS.p) as any
      )
    ).toBe(false);
    expect(
      options.query?.(
        createListNode(KEYS.h1, { indent: 2 }) as any,
        createListNode(KEYS.p) as any
      )
    ).toBe(false);
  });

  it('does not break lookup at heading and non-heading boundaries with different list styles', () => {
    const options = getListSequenceSiblingOptions({} as any);

    expect(
      options.breakQuery?.(
        createListNode(KEYS.h1, { listStyleType: 'disc' }) as any,
        createListNode(KEYS.p) as any
      )
    ).toBe(false);
    expect(
      options.query?.(
        createListNode(KEYS.h1, { listStyleType: 'disc' }) as any,
        createListNode(KEYS.p) as any
      )
    ).toBe(false);
    expect(
      options.breakQuery?.(
        createListNode(KEYS.h1, { listStyleType: undefined }) as any,
        createListNode(KEYS.p) as any
      )
    ).toBe(false);
  });
});
