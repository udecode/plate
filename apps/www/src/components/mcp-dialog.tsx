'use client';

import { useState } from 'react';

import { Code } from '@/components/code';
import { CodeBlock } from '@/components/codeblock';
import { Icons } from '@/components/icons';
import { Step, Steps } from '@/components/typography';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { siteConfig } from '@/config/site';

export function SetupMCPDialog() {
  const [open, setOpen] = useState(false);

  const initCommand = `npx shadcn@canary add ${siteConfig.registryUrl}editor-basic`;
  const cursorConfig = `{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["-y", "shadcn@canary", "registry:mcp"],
      "env": {
        "REGISTRY_URL": "${siteConfig.registryUrl}registry.json"
      }
    }
  }
}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="!px-2">
          <Icons.mcp className="size-4" />
          <span>MCP</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden sm:max-w-3xl">
        <DialogHeader className="w-full">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Setup MCP</DialogTitle>
          </div>
          <p className="mt-2 text-muted-foreground">
            Use the code below to configure the registry MCP in your IDE.
          </p>
        </DialogHeader>

        <Steps>
          <Step title="Start from our basic template">
            <CodeBlock
              className="overflow-x-auto"
              value={initCommand}
              language="bash"
            />
          </Step>

          <Step title="Add MCP config">
            <Tabs className="mt-2" defaultValue="cursor">
              <TabsList>
                <TabsTrigger value="cursor">Cursor</TabsTrigger>
                <TabsTrigger value="windsurf">Windsurf</TabsTrigger>
              </TabsList>
              <TabsContent className="mt-0" value="cursor">
                <h2 className="font-semibold">
                  Copy and paste the code into <Code>.cursor/mcp.json</Code>
                </h2>
                <CodeBlock
                  className="mt-2"
                  value={cursorConfig}
                  language="json"
                />
              </TabsContent>
              <TabsContent className="mt-0" value="windsurf">
                <h2 className="font-semibold">
                  2. Copy and paste the code into{' '}
                  <Code>.codeium/windsurf/mcp_config.json</Code>
                </h2>
                <CodeBlock
                  className="mt-2"
                  value={cursorConfig}
                  language="json"
                />
              </TabsContent>
            </Tabs>
          </Step>
        </Steps>
      </DialogContent>
    </Dialog>
  );
}
