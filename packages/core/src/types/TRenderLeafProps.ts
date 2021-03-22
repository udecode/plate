import { RenderLeafProps } from 'slate-react';
import { TText } from './TText';

type Extension = { attributes?: { [key: string]: any } };

export type TRenderLeafProps<TExtension = {}> = Omit<
  RenderLeafProps,
  'leaf' | 'text'
> & {
  leaf: TText<Extension & TExtension>;
  text: TText<Extension & TExtension>;
};
