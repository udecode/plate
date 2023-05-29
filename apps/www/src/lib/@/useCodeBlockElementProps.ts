import { useEffect, useState } from 'react';
import { TCodeBlockElement } from '@udecode/plate-code-block';

export const useCodeBlockElementProps = ({
  element,
}: {
  element: TCodeBlockElement;
}) => {
  const [domLoaded, setDomLoaded] = useState(false);
  const { lang } = element;

  const codeClassName = lang ? `${lang} language-${lang}` : '';

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  return {
    className: domLoaded && codeClassName,
  };
};
