import { Element } from 'slate';
import {
  NodeStyleProps,
  NodeStyleSet,
  StyledNodeProps,
} from '../StyledNode/StyledNode.types';

export interface StyledElementProps<
  TElement = Element,
  TStyleProps = NodeStyleProps,
  TStyleSet = NodeStyleSet
> extends StyledNodeProps<TStyleProps, TStyleSet> {
  attributes: {
    'data-slate-node': 'element';
    'data-slate-inline'?: true;
    'data-slate-void'?: true;
    dir?: 'rtl';
    ref: any;
    [key: string]: any;
  };
  children: any;
  element: Element & TElement;
}
