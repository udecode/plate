import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type SideThreadPosition = {
  left: number;
  top: number;
};

export type SideThreadRootProps = {
  position: SideThreadPosition;
} & HTMLPropsAs<'div'>;

export const useSideThreadRoot = (props: SideThreadRootProps) => {
  const { position, ...rest } = props;

  return { style: { ...position }, ...rest };
};

export const SideThreadRoot = createComponentAs<SideThreadRootProps>(
  (props) => {
    const htmlProps = useSideThreadRoot(props);
    return createElementAs('div', htmlProps);
  }
);
