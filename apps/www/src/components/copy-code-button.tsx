import * as React from 'react';

import { CheckIcon, CopyIcon } from '@radix-ui/react-icons';
import { cn } from '@udecode/cn';
import { ClipboardIcon } from 'lucide-react';

import { useConfig } from '@/hooks/use-config';
import { useThemesConfig } from '@/hooks/use-themes-config';
import { type Theme, themeColorsToCssVariables } from '@/lib/themes';
import { Button } from '@/registry/default/plate-ui/button';

import { copyToClipboardWithMeta } from './copy-button';

export function CopyCodeButton({
  className,
  compact,
  ...props
}: React.ComponentProps<typeof Button> & { compact?: boolean }) {
  const [config] = useConfig();
  const { themesConfig } = useThemesConfig();
  const activeTheme = themesConfig.activeTheme;
  const [hasCopied, setHasCopied] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  }, [hasCopied]);

  const themeCode = React.useMemo(() => {
    return getThemeCode(activeTheme, config.radius);
  }, [activeTheme, config.radius]);

  if (compact) {
    return (
      <Button
        size="icon"
        variant="ghost"
        className={cn('size-7 rounded-[6px] [&_svg]:size-3.5', className)}
        onClick={() => {
          copyToClipboardWithMeta(themeCode, {
            name: 'copy_theme_code',
            properties: {
              radius: config.radius,
              theme: activeTheme.name,
            },
          });
          setHasCopied(true);
        }}
        {...props}
      >
        <span className="sr-only">Copy</span>
        {hasCopied ? <CheckIcon /> : <ClipboardIcon />}
      </Button>
    );
  }

  return (
    <Button
      className={cn(className)}
      onClick={() => {
        copyToClipboardWithMeta(themeCode, {
          name: 'copy_theme_code',
          properties: {
            radius: config.radius,
            theme: activeTheme.name,
          },
        });
        setHasCopied(true);
      }}
      {...props}
    >
      {hasCopied ? <CheckIcon /> : <CopyIcon />}
      Copy code
    </Button>
  );
}

export function getThemeCode(theme: Theme, radius: number): string {
  if (!theme) {
    return '';
  }

  const lightVars = themeColorsToCssVariables(theme.colors);
  const darkVars = themeColorsToCssVariables(theme.colorsDark);

  return `\
@layer base {
  :root {
${Object.entries(lightVars)
  .map(([key, value]) => `    ${key}: ${value};`)
  .join('\n')}
    --radius: ${radius}rem;
  }

  .dark {
${Object.entries(darkVars)
  .map(([key, value]) => `    ${key}: ${value};`)
  .join('\n')}
  }
}
`;
}
