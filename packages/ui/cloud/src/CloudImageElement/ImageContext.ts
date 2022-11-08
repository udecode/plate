import React, { Dispatch, SetStateAction, useContext } from 'react';
import { Upload } from '@udecode/plate-cloud';

export const ImageContext = React.createContext<{
  upload: Upload;
  size: { width: number; height: number };
  setSize: Dispatch<SetStateAction<{ width: number; height: number }>>;
} | null>(null);

export function useImageContext() {
  const context = useContext(ImageContext);
  if (context == null) {
    throw new Error(`Expected context to not be null`);
  }
  return context;
}
