import { Text } from 'slate';
import { AnyObject } from '../utility/AnyObject';

export type TText<TExtension = AnyObject> = Text & TExtension & AnyObject;

export const isText: <TExtension = AnyObject>(
  value: any
) => value is TText<TExtension> = Text.isText as any;
