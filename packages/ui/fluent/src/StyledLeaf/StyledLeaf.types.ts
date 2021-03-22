import { Text } from 'slate';
import {
  NodeStyleProps,
  NodeStyleSet,
  StyledNodeProps,
} from '../StyledNode/StyledNode.types';

export interface StyledLeafProps<
  TText = Text,
  TStyleProps = NodeStyleProps,
  TStyleSet = NodeStyleSet
> extends StyledNodeProps<TStyleProps, TStyleSet> {
  children: any;
  text: Text;
  leaf: Text & TText;
}
