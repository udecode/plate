"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

import { Tabs, TabsList, TabsTrigger } from "./ui/tabs"

export function ComponentPreviewTabs({
  align = "center",
  className,
  component,
  hideCode = false,
  source,
  ...props
}: React.ComponentProps<"div"> & {
  component: React.ReactNode
  source: React.ReactNode
  align?: "center" | "end" | "start"
  hideCode?: boolean
}) {
  const [tab, setTab] = React.useState("preview")

  return (
    <div
      className={cn("group relative mt-4 mb-12 flex flex-col gap-2", className)}
      {...props}
    >
      <Tabs
        className="relative mr-auto w-full"
        value={tab}
        onValueChange={setTab}
      >
        <div className="flex items-center justify-between">
          {!hideCode && (
            <TabsList className="justify-start gap-4 rounded-none bg-transparent px-2 md:px-0">
              <TabsTrigger
                className="text-muted-foreground data-[state=active]:text-foreground px-0 text-base data-[state=active]:shadow-none dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-transparent"
                value="preview"
              >
                Preview
              </TabsTrigger>
              <TabsTrigger
                className="text-muted-foreground data-[state=active]:text-foreground px-0 text-base data-[state=active]:shadow-none dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-transparent"
                value="code"
              >
                Code
              </TabsTrigger>
            </TabsList>
          )}
        </div>
      </Tabs>
      <div
        className="data-[tab=code]:border-code relative rounded-lg border md:-mx-1"
        data-tab={tab}
      >
        <div
          className="invisible data-[active=true]:visible"
          data-active={tab === "preview"}
          data-slot="preview"
        >
          <div
            className={cn(
              "preview flex h-[450px] w-full justify-center p-10 data-[align=center]:items-center data-[align=end]:items-end data-[align=start]:items-start"
            )}
            data-align={align}
          >
            {component}
          </div>
        </div>
        <div
          className="absolute inset-0 hidden overflow-hidden data-[active=true]:block **:[figure]:!m-0 **:[pre]:h-[450px]"
          data-active={tab === "code"}
          data-slot="code"
        >
          {source}
        </div>
      </div>
    </div>
  )
}
