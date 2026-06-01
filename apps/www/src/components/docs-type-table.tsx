import type { ComponentProps, ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

type ParameterNode = {
  description?: ReactNode;
  name: string;
};

type TypeNode = {
  default?: ReactNode;
  deprecated?: boolean;
  description?: ReactNode;
  parameters?: ParameterNode[];
  required?: boolean;
  returns?: ReactNode;
  type: ReactNode;
  typeDescription?: ReactNode;
  typeDescriptionLink?: string;
};

function TypeCell({ item }: { item: TypeNode }) {
  return (
    <div className="space-y-1">
      <div className="font-mono text-[0.85rem]">{item.type}</div>
      {item.typeDescription ? (
        item.typeDescriptionLink ? (
          <a
            className="font-mono text-muted-foreground text-xs underline underline-offset-4"
            href={item.typeDescriptionLink}
          >
            {item.typeDescription}
          </a>
        ) : (
          <div className="font-mono text-muted-foreground text-xs">
            {item.typeDescription}
          </div>
        )
      ) : null}
    </div>
  );
}

function DescriptionCell({ item }: { item: TypeNode }) {
  return (
    <div className="space-y-2">
      {item.description ? <div>{item.description}</div> : null}
      {item.default ? (
        <div className="text-muted-foreground text-xs">
          Default: <span className="font-mono">{item.default}</span>
        </div>
      ) : null}
      {item.parameters?.length ? (
        <div className="space-y-1 text-xs">
          {item.parameters.map((parameter) => (
            <div key={parameter.name}>
              <span className="font-mono">{parameter.name}</span>
              {parameter.description ? (
                <span className="text-muted-foreground">
                  {' '}
                  - {parameter.description}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      {item.returns ? (
        <div className="text-muted-foreground text-xs">
          Returns: {item.returns}
        </div>
      ) : null}
    </div>
  );
}

export function TypeTable({
  className,
  type,
  ...props
}: {
  type: Record<string, TypeNode>;
} & ComponentProps<'div'>) {
  return (
    <div className={cn('my-6 overflow-x-auto', className)} {...props}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Prop</TableHead>
            <TableHead className="w-[260px]">Type</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(type).map(([name, item]) => (
            <TableRow key={name}>
              <TableCell className="align-top">
                <div className="flex flex-wrap items-center gap-1.5">
                  <code>{name}</code>
                  {item.required ? (
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-1 py-0 text-[0.65rem]"
                    >
                      required
                    </Badge>
                  ) : null}
                  {item.deprecated ? (
                    <Badge
                      variant="destructive"
                      className="rounded-sm px-1 py-0 text-[0.65rem]"
                    >
                      deprecated
                    </Badge>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="align-top">
                <TypeCell item={item} />
              </TableCell>
              <TableCell className="align-top">
                <DescriptionCell item={item} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
