import type { BaseHeadingPlugin } from '@platejs/basic-nodes';
import { cva } from 'class-variance-authority';
import type { PliteElementProps } from 'platejs/static';
import { PliteElement } from 'platejs/static';
import * as React from 'react';

const headingVariants = cva('relative mb-1', {
  variants: {
    level: {
      1: 'mt-[1.6em] pb-1 font-bold font-heading text-4xl',
      2: 'mt-[1.4em] pb-px font-heading font-semibold text-2xl tracking-tight',
      3: 'mt-[1em] pb-px font-heading font-semibold text-xl tracking-tight',
      4: 'mt-[0.75em] font-heading font-semibold text-lg tracking-tight',
      5: 'mt-[0.75em] font-semibold text-lg tracking-tight',
      6: 'mt-[0.75em] font-semibold text-base tracking-tight',
    },
  },
});

type HeadingProps = PliteElementProps<typeof BaseHeadingPlugin>;

export function HeadingElementStatic(props: HeadingProps) {
  const level = props.element.level;
  const tag = `h${level}` as const;

  return (
    <PliteElement as={tag} className={headingVariants({ level })} {...props}>
      {props.children}
    </PliteElement>
  );
}

export function HeadingElementDocx(props: HeadingProps) {
  const key = props.editor.key(props.path);

  return (
    <HeadingElementStatic {...props}>
      {key && <span id={`plate_${key.replaceAll(/[^A-Za-z0-9_]/g, '_')}`} />}
      {props.children}
    </HeadingElementStatic>
  );
}
