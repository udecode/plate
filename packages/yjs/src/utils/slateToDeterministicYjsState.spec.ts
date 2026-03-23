import { yTextToSlateElement } from '@slate-yjs/core';
import * as Y from 'yjs';

import { slateToDeterministicYjsState } from './slateToDeterministicYjsState';

describe('slateToDeterministicYjsState', () => {
  it('returns bit-identical updates for the same guid and Slate value', async () => {
    const value = [{ type: 'p', children: [{ text: 'hello' }] }];

    const first = await slateToDeterministicYjsState('doc-a', value as any);
    const second = await slateToDeterministicYjsState('doc-a', value as any);

    expect([...first]).toEqual([...second]);
  });

  it('changes when the guid changes', async () => {
    const value = [{ type: 'p', children: [{ text: 'hello' }] }];

    const first = await slateToDeterministicYjsState('doc-a', value as any);
    const second = await slateToDeterministicYjsState('doc-b', value as any);

    expect([...first]).not.toEqual([...second]);
  });

  it('changes when the Slate value changes', async () => {
    const first = await slateToDeterministicYjsState('doc-a', [
      { type: 'p', children: [{ text: 'hello' }] },
    ] as any);
    const second = await slateToDeterministicYjsState('doc-a', [
      { type: 'p', children: [{ text: 'hello world' }] },
    ] as any);

    expect([...first]).not.toEqual([...second]);
  });

  it('hydrates the expected shared content update', async () => {
    const value = [
      { type: 'p', children: [{ text: 'hello' }] },
      { type: 'p', children: [{ text: 'world' }] },
    ];
    const update = await slateToDeterministicYjsState('doc-a', [
      ...value,
    ] as any);
    const ydoc = new Y.Doc();
    const content = ydoc.get('content', Y.XmlText) as Y.XmlText;

    Y.applyUpdate(ydoc, update);

    expect(yTextToSlateElement(content).children).toEqual(value);
  });
});
