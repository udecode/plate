import * as React from 'react';

import type {
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseH4Plugin,
  BaseH5Plugin,
  BaseH6Plugin,
} from '@platejs/basic-nodes';
import type { PliteElementProps } from 'platejs/static';

import { type VariantProps, cva } from 'class-variance-authority';
import { PliteElement } from 'platejs/static';

const headingVariants = cva('relative mb-1', {
  variants: {
    variant: {
      h1: 'mt-[1.6em] pb-1 font-bold font-heading text-4xl',
      h2: 'mt-[1.4em] pb-px font-heading font-semibold text-2xl tracking-tight',
      h3: 'mt-[1em] pb-px font-heading font-semibold text-xl tracking-tight',
      h4: 'mt-[0.75em] font-heading font-semibold text-lg tracking-tight',
      h5: 'mt-[0.75em] font-semibold text-lg tracking-tight',
      h6: 'mt-[0.75em] font-semibold text-base tracking-tight',
    },
  },
});

type HeadingVariant = NonNullable<
  VariantProps<typeof headingVariants>['variant']
>;

type HeadingElementStaticProps = (
  | PliteElementProps<typeof BaseH1Plugin>
  | PliteElementProps<typeof BaseH2Plugin>
  | PliteElementProps<typeof BaseH3Plugin>
  | PliteElementProps<typeof BaseH4Plugin>
  | PliteElementProps<typeof BaseH5Plugin>
  | PliteElementProps<typeof BaseH6Plugin>
) & { variant?: HeadingVariant };

export function HeadingElementStatic({
  variant = 'h1',
  ...props
}: HeadingElementStaticProps) {
  return (
    <PliteElement
      as={variant}
      className={headingVariants({ variant })}
      {...props}
    >
      {props.children}
    </PliteElement>
  );
}

function HeadingElementDocx({
  variant = 'h1',
  ...props
}: HeadingElementStaticProps) {
  const key = props.editor.key(props.path);

  return (
    <HeadingElementStatic variant={variant} {...props}>
      {key && <span id={`plate_${key.replaceAll(/[^A-Za-z0-9_]/g, '_')}`} />}
      {props.children}
    </HeadingElementStatic>
  );
}

export function H1ElementStatic(props: PliteElementProps<typeof BaseH1Plugin>) {
  return <HeadingElementStatic variant="h1" {...props} />;
}

export function H2ElementStatic(props: PliteElementProps<typeof BaseH2Plugin>) {
  return <HeadingElementStatic variant="h2" {...props} />;
}

export function H3ElementStatic(props: PliteElementProps<typeof BaseH3Plugin>) {
  return <HeadingElementStatic variant="h3" {...props} />;
}

export function H4ElementStatic(props: PliteElementProps<typeof BaseH4Plugin>) {
  return <HeadingElementStatic variant="h4" {...props} />;
}

export function H5ElementStatic(props: PliteElementProps<typeof BaseH5Plugin>) {
  return <HeadingElementStatic variant="h5" {...props} />;
}

export function H6ElementStatic(props: PliteElementProps<typeof BaseH6Plugin>) {
  return <HeadingElementStatic variant="h6" {...props} />;
}

export function H1ElementDocx(props: PliteElementProps<typeof BaseH1Plugin>) {
  return <HeadingElementDocx variant="h1" {...props} />;
}

export function H2ElementDocx(props: PliteElementProps<typeof BaseH2Plugin>) {
  return <HeadingElementDocx variant="h2" {...props} />;
}

export function H3ElementDocx(props: PliteElementProps<typeof BaseH3Plugin>) {
  return <HeadingElementDocx variant="h3" {...props} />;
}

export function H4ElementDocx(props: PliteElementProps<typeof BaseH4Plugin>) {
  return <HeadingElementDocx variant="h4" {...props} />;
}

export function H5ElementDocx(props: PliteElementProps<typeof BaseH5Plugin>) {
  return <HeadingElementDocx variant="h5" {...props} />;
}

export function H6ElementDocx(props: PliteElementProps<typeof BaseH6Plugin>) {
  return <HeadingElementDocx variant="h6" {...props} />;
}
