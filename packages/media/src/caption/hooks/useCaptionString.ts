import { useMemo } from 'react';
import { getNodeString, useElement } from '@udecode/plate-common';
import { TCaptionElement } from '../types/TCaptionElement';

export const useCaptionString = () => {
  const { caption: nodeCaption = [{ children: [{ text: '' }] }] } =
    useElement<TCaptionElement>();

  return useMemo(() => {
    return getNodeString(nodeCaption[0] as any) || '';
  }, [nodeCaption]);
};
