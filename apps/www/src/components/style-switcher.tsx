'use client';

import * as React from 'react';

import type { SelectTriggerProps } from '@radix-ui/react-select';

import { cn } from '@udecode/cn';

import { useConfig } from '@/hooks/use-config';
import { type Style, styles } from '@/registry/styles';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export function StyleSwitcher({ className }: SelectTriggerProps) {
  const [config, setConfig] = useConfig();

  return (
    <Select
      onValueChange={(value: Style['name']) =>
        setConfig({
          ...config,
          style: value,
        })
      }
      value={config.style}
    >
      <SelectTrigger
        className={cn('h-7 w-[145px] text-xs [&_svg]:size-4', className)}
      >
        <span className="text-muted-foreground">Style: </span>
        <SelectValue placeholder="Select style" />
      </SelectTrigger>
      <SelectContent>
        {styles.map((style) => (
          <SelectItem className="text-xs" key={style.name} value={style.name}>
            {style.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
