import { useMemo } from 'react';
import { getNodeString } from '@udecode/plate-core';
import { useImageElement } from './useImageElement';

export const useImageCaptionString = () => {
  const {
    caption: nodeCaption = [{ children: [{ text: '' }] }],
  } = useImageElement();

  return useMemo(() => {
    return getNodeString(nodeCaption[0] as any) || '';
  }, [nodeCaption]);
};
