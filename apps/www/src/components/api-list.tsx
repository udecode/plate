import React from 'react';
import { Separator } from './ui/separator';
import { Code } from './code';
import { Icons } from './icons';

type PropDef = {
  name: string;
  required?: boolean;
  default?: string | boolean;
  type: string;
  description?: string;
};

export function APIList({
  name,
  type = 'function',
  description,
  data,
}: {
  name?: string;
  type?: string;
  description?: string;
  data: PropDef[];
}) {
  return (
    <section className="flex w-full flex-col items-center">
      <Separator />

      <div className="py-16">
        <div>
          <h1 className="font-mono text-2xl font-semibold">
            <Code>{name}</Code>
          </h1>
        </div>
        {!!description && <p className="mt-8">{description}</p>}

        <div className="mt-8 pb-3 ">
          <h3 className="mt-5 pb-3 text-lg font-medium leading-none tracking-tight">
            {type === 'function' && <span>Parameters</span>}
            {type === 'object' && <span>Attributes</span>}
          </h3>

          <Separator />

          <ul className="m-0 list-none p-0">
            {data.map((item, i) => (
              <li
                key={`${item.name}-${i}`}
                id={`#${item.name}`}
                className="py-4"
              >
                <h4 className="group flex items-center font-semibold leading-none tracking-tight">
                  <a
                    href={`#${item.name}`}
                    className="hidden group-hover:block"
                  >
                    <div className="absolute -left-5 pr-1">
                      <Icons.pragma className="h-4 w-4" />
                    </div>
                  </a>
                  <span className="mr-1 font-mono font-semibold leading-none">
                    {item.name}
                  </span>
                  <span className="mr-1 font-mono text-sm font-medium leading-none text-muted-foreground">
                    {item.type}
                  </span>
                </h4>

                <div>
                  <p>{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// {data.map(
//   (
//     {
//       name,
//       type,
//       required,
//       default: defaultValue,
//       description,
//     },
//     i
//   ) => (
//     <tr key={`${name}-${i}`}>
//       <Box
//         as="td"
//         css={{
//           borderBottom: '1px solid $gray6',
//           py: '$3',
//           pr: '$4',
//           whiteSpace: 'nowrap',
//         }}
//       >
//         <Code>
//           {name}
//           {required ? '*' : null}
//         </Code>
//         {description && (
//           <Popover>
//             <PopoverTrigger asChild>
//               <IconButton
//                 variant="ghost"
//                 css={{
//                   ml: '$1',
//                   verticalAlign: 'middle',
//                   color: '$gray11',
//                 }}
//               >
//                 <AccessibleIcon label="Prop description">
//                   <InfoCircledIcon />
//                 </AccessibleIcon>
//               </IconButton>
//             </PopoverTrigger>
//             <PopoverContent
//               side="top"
//               onOpenAutoFocus={(event) => {
//                 event.preventDefault();
//                 (event.currentTarget as HTMLElement)?.focus();
//               }}
//             >
//               <Box css={{ py: '$2', px: '$3' }}>
//                 <Text size="2" css={{ lineHeight: '20px' }}>
//                   {description}
//                 </Text>
//               </Box>
//             </PopoverContent>
//           </Popover>
//         )}
//       </Box>
//       <Box
//         as="td"
//         css={{ borderBottom: '1px solid $gray6', py: '$3', pr: '$4' }}
//       >
//         <Code css={{ bc: '$gray4', color: '$gray11' }}>
//           {type || type}
//         </Code>
//         {Boolean(type) && (
//           <Popover>
//             <PopoverTrigger asChild>
//               <IconButton
//                 variant="ghost"
//                 css={{
//                   ml: '$1',
//                   verticalAlign: 'middle',
//                   color: '$gray11',
//                   display: 'none',
//                   '@bp1': { display: 'inline-flex' },
//                 }}
//               >
//                 <AccessibleIcon label="See full type">
//                   <InfoCircledIcon />
//                 </AccessibleIcon>
//               </IconButton>
//             </PopoverTrigger>
//             <PopoverContent
//               side="top"
//               css={{ maxWidth: 'max-content' }}
//             >
//               <Box css={{ py: '$2', px: '$2', whiteSpace: 'nowrap' }}>
//                 <Code>{type}</Code>
//               </Box>
//             </PopoverContent>
//           </Popover>
//         )}
//       </Box>
//       <Box
//         as="td"
//         css={{ borderBottom: '1px solid $gray6', py: '$3', pr: '$4' }}
//       >
//         {defaultValue ? (
//           <Code css={{ bc: '$gray4', color: '$gray11' }}>
//             {defaultValue}
//           </Code>
//         ) : (
//           <Box
//             as={AccessibleIcon}
//             label="No default value"
//             css={{ color: '$gray8' }}
//           >
//             <DividerHorizontalIcon />
//           </Box>
//         )}
//       </Box>
//     </tr>
//   )
// )}
// </tbody>
