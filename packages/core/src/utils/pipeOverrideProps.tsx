import { GetNodeProps } from '../types/PlatePluginOptions/GetNodeProps';
import { AnyObject } from '../types/utility/AnyObject';

export const pipeOverrideProps = <T,>(
  props: T,
  overriders: GetNodeProps[]
): T & AnyObject => {
  overriders.forEach((overrideProps) => {
    const newProps = overrideProps(props as any);

    if (newProps) {
      props = {
        ...props,
        ...newProps,
      };
    }
  });

  return props;
};
