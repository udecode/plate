import { createAtomStore } from '@udecode/plate-core';
import { Origin } from 'slate-portive';

export const { hostedImageStore, useHostedImageStore } = createAtomStore(
  {
    origin: null as Origin | null,
    size: null as [number, number] | null,
  },
  { name: 'hostedImage', scope: 'hostedImage' }
);
