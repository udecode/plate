import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type ThreadLinkDialogInputProps = {
  threadLink: string;
} & HTMLPropsAs<'input'>;

export const useThreadLinkDialogInput = (
  props: ThreadLinkDialogInputProps
): HTMLPropsAs<'input'> => {
  const { threadLink } = props;

  return { ...props, defaultValue: threadLink, readOnly: true };
};

export const ThreadLinkDialogInput = createComponentAs<ThreadLinkDialogInputProps>(
  (props) => {
    const htmlProps = useThreadLinkDialogInput(props);
    return createElementAs('input', htmlProps);
  }
);
