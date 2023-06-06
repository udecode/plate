import { ElementType, ReactNode } from 'react';
import { AnyObject } from '@udecode/utils';

export type ClassNames<T> = {
  classNames?: Partial<T>;
};

/**
 * Render prop type.
 * @template P Props
 * @example
 * const children: RenderProp = (props) => <div {...props} />;
 */
export type RenderProp<P = AnyObject> = (props: P) => ReactNode;

/**
 * The `as` prop.
 * @template P Props
 */
export type As<P = any> = ElementType<P>;
