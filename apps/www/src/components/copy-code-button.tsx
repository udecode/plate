import * as React from 'react';

import type { Theme } from '@/lib/themes';

import { CheckIcon, CopyIcon } from '@radix-ui/react-icons';
import { ClipboardIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useConfig } from '@/hooks/use-config';
import { useThemesConfig } from '@/hooks/use-themes-config';
import { cn } from '@/lib/utils';

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

  const themeCode = React.useMemo(
    () => getThemeCode(activeTheme, config.radius),
    [activeTheme, config.radius]
  );

  if (compact) {
    return (
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          'size-7 rounded-[6px] text-primary-foreground [&_svg]:size-3.5',
          className
        )}
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
      className={className}
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

export function getThemeCode(theme: Theme | undefined, radius: number) {
  if (!theme) {
    return '';
  }

  const rootSection =
    ':root {\n  --radius: ' +
    radius +
    'rem;\n' +
    Object.entries(theme.light)
      .map((entry) => `  ${entry[0]}: ${entry[1]};`)
      .join('\n') +
    '\n}\n\n.dark {\n' +
    Object.entries(theme.dark)
      .map((entry) => `  ${entry[0]}: ${entry[1]};`)
      .join('\n') +
    '\n}\n';

  return rootSection;
}
