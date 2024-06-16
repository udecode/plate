import { useEffect, useRef, useState } from 'react';

import { isHotkey } from '@udecode/plate-common/server';

import {
  imagePreviewActions,
  useImagePreviewSelectors,
} from '../image-preview-store';

export const useScaleInputState = () => {
  const scale = useImagePreviewSelectors().scale();
  const setScale = imagePreviewActions.scale;

  const isEditingScale = useImagePreviewSelectors().isEditingScale();
  const setIsEditingScale = imagePreviewActions.isEditingScale;

  const [value, setValue] = useState(scale * 100 + '');
  const inputRef = useRef<HTMLInputElement>();

  return {
    inputRef,
    isEditingScale,
    setIsEditingScale,
    setScale,
    setValue,
    value,
  };
};

export const useScaleInput = ({
  inputRef,
  isEditingScale,
  setIsEditingScale,
  setScale,
  setValue,
  value,
}: ReturnType<typeof useScaleInputState>) => {
  useEffect(() => {
    if (!isEditingScale) return;

    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditingScale]);

  return {
    props: {
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
      },
      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isHotkey('enter')(e)) {
          if (Number(value) <= 50) {
            setScale(0.5);
            setIsEditingScale(false);

            return;
          }
          if (Number(value) >= 200) {
            setScale(2);
            setIsEditingScale(false);

            return;
          }

          setScale(Number((Number(value) / 100).toFixed(2)));
          setIsEditingScale(false);
        }
      },
      value: value,
    },
    ref: inputRef,
  };
};
