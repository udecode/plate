'use client';

import React, { forwardRef, useState, useEffect } from 'react';
import BottomSheetPrimitive from 'react-modal-sheet';

export type BottomSheetProps = React.ComponentProps<typeof BottomSheetPrimitive>;
export type BottomSheetContainerProps = React.ComponentProps<typeof BottomSheetPrimitive.Container>;
export type BottomSheetHeaderProps = React.ComponentProps<typeof BottomSheetPrimitive.Header>;
export type BottomSheetBackdropProps = React.ComponentProps<typeof BottomSheetPrimitive.Backdrop>;
export type BottomSheetContentProps = React.ComponentProps<typeof BottomSheetPrimitive.Content>;

export const BottomSheet = forwardRef<HTMLDivElement, BottomSheetProps>((props, ref) => {
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
});

export const BottomSheetContainer = BottomSheetPrimitive.Container as React.FC<BottomSheetContainerProps>;
export const BottomSheetHeader = BottomSheetPrimitive.Header as React.FC<BottomSheetHeaderProps>;
export const BottomSheetBackdrop = BottomSheetPrimitive.Backdrop as React.FC<BottomSheetBackdropProps>;

export const BottomSheetContent = forwardRef<HTMLDivElement, BottomSheetContentProps>((props, ref) => {
  return <BottomSheetPrimitive.Content ref={ref} disableDrag {...props} />;
});
