import { useParams } from 'react-router-dom';

export const useVariant = <T>(variants: Record<string, T>) => {
  const { variant } = useParams<{ variant: string }>();
  const activeVariant = variants[variant!];

  if (!activeVariant) {
    throw new Error(
      `Invalid variant: ${variant}. Expected one of ${Object.keys(
        variants
      ).join(', ')}`
    );
  }

  return activeVariant;
};
