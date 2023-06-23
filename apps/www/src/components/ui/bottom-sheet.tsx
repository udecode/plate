'use client';

import React, { forwardRef, useEffect, useState } from 'react';
import BottomSheetPrimitive from 'react-modal-sheet';

export type BottomSheetProps = React.ComponentProps<
  typeof BottomSheetPrimitive
>;
export type BottomSheetContainerProps = React.ComponentProps<
  typeof BottomSheetPrimitive.Container
>;
export type BottomSheetHeaderProps = React.ComponentProps<
  typeof BottomSheetPrimitive.Header
>;
export type BottomSheetBackdropProps = React.ComponentProps<
  typeof BottomSheetPrimitive.Backdrop
>;
export type BottomSheetContentProps = React.ComponentProps<
  typeof BottomSheetPrimitive.Content
>;

const BottomSheet = forwardRef<HTMLDivElement, BottomSheetProps>(
  (props, ref) => {
    const [isFirstRender, setIsFirstRender] = useState(true);

    useEffect(() => {
      setIsFirstRender(false);
    }, []);

    return (
      <BottomSheetPrimitive
        ref={ref}
        snapPoints={[0.8, 0]}
        // Prevent close animation on first render
        prefersReducedMotion={isFirstRender}
        {...props}
      />
    );
  }
);
BottomSheet.displayName = 'BottomSheet';

const BottomSheetContainer =
  BottomSheetPrimitive.Container as React.FC<BottomSheetContainerProps>;
const BottomSheetHeader =
  BottomSheetPrimitive.Header as React.FC<BottomSheetHeaderProps>;
const BottomSheetBackdrop =
  BottomSheetPrimitive.Backdrop as React.FC<BottomSheetBackdropProps>;

const BottomSheetContent = forwardRef<HTMLDivElement, BottomSheetContentProps>(
  (props, ref) => {
    return <BottomSheetPrimitive.Content ref={ref} disableDrag {...props} />;
  }
);
BottomSheetContent.displayName = 'BottomSheetContent';

export {
  BottomSheet,
  BottomSheetContainer,
  BottomSheetHeader,
  BottomSheetBackdrop,
  BottomSheetContent,
};
