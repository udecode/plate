export const TextString = ({
  text,
  isTrailing = false,
}: {
  text: string;
  isTrailing?: boolean;
}) => <span data-plite-string>{`${text ?? ''}${isTrailing ? '\n' : ''}`}</span>;
