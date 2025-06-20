'use client';

import * as React from 'react';

import type { PlateElementProps } from 'platejs/react';

import { type VariantProps, cva } from 'class-variance-authority';
import { PlateElement, usePluginOption } from 'platejs/react';

const headingVariants = cva('relative mb-1', {
  variants: {
    variant: {
      h1: 'mt-[1.6em] pb-1 font-heading text-4xl font-bold',
      h2: 'mt-[1.4em] pb-px font-heading text-2xl font-semibold tracking-tight',
      h3: 'mt-[1em] pb-px font-heading text-xl font-semibold tracking-tight',
      h4: 'mt-[0.75em] font-heading text-lg font-semibold tracking-tight',
      h5: 'mt-[0.75em] text-lg font-semibold tracking-tight',
      h6: 'mt-[0.75em] text-base font-semibold tracking-tight',
    },
  },
});

const DropMarginFix = ({
  height,
  position,
}: {
  height: string;
  position: 'bottom' | 'top';
}) => {
  const isDragging = usePluginOption({ key: 'dnd' }, 'isDragging');

  return (
    <div
      className="absolute left-0 w-full"
      style={{
        height,
        pointerEvents: isDragging ? 'auto' : 'none',
        [position]: `-${height}`,
      }}
      contentEditable={false}
    />
  );
};

export function HeadingElement({
  height,
  variant = 'h1',
  ...props
}: PlateElementProps &
  VariantProps<typeof headingVariants> & { height: string }) {
  return (
    <PlateElement
      as={variant!}
      className={headingVariants({ variant })}
      {...props}
    >
      <DropMarginFix height={height} position="top" />
      {props.children}
    </PlateElement>
  );
}

export function H1Element(props: PlateElementProps) {
  return <HeadingElement variant="h1" {...props} height="1.6em" />;
}

export function H2Element(props: PlateElementProps) {
  return <HeadingElement variant="h2" {...props} height="1.4em" />;
}

export function H3Element(props: PlateElementProps) {
  return <HeadingElement variant="h3" {...props} height="1em" />;
}

export function H4Element(props: PlateElementProps) {
  return <HeadingElement variant="h4" {...props} height="0.75em" />;
}

export function H5Element(props: PlateElementProps) {
  return <HeadingElement variant="h5" {...props} height="0.75em" />;
}

export function H6Element(props: PlateElementProps) {
  return <HeadingElement variant="h6" {...props} height="0.75em" />;
}
