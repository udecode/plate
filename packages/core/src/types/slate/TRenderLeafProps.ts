import { RenderLeafProps } from 'slate-react';
import { AnyObject } from '../utility/AnyObject';
import { TText } from './TText';

type Extension = { attributes?: AnyObject };

export type TRenderLeafProps<TExtension = AnyObject> = Omit<
  RenderLeafProps,
  'leaf' | 'text'
> & {
  leaf: TText<Extension & TExtension>;
  text: TText<Extension & TExtension>;
};
