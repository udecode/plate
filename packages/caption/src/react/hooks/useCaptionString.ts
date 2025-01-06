import React from 'react';

import { NodeApi } from '@udecode/plate';
import { useElement } from '@udecode/plate/react';

import type { TCaptionElement } from '../../lib';

export const useCaptionString = () => {
  const { caption: nodeCaption = [{ children: [{ text: '' }] }] } =
    useElement<TCaptionElement>();

  return React.useMemo(() => {
    return NodeApi.string(nodeCaption[0] as any) || '';
  }, [nodeCaption]);
};
