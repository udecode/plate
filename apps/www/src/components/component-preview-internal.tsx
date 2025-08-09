import Image from "next/image"

import { Index } from "@/__registry__"
import { ComponentPreviewTabs } from "@/components/component-preview-tabs"
import { ComponentSource } from "@/components/component-source"

export function ComponentPreviewInternal({
  align = "center",
  className,
  hideCode = false,
  name,
  type,
  ...props
}: React.ComponentProps<"div"> & {
  name: string
  align?: "center" | "end" | "start"
  description?: string
  hideCode?: boolean
  type?: "block" | "component" | "example"
}) {
  const Component = Index[name]?.component

  if (!Component) {
    return (
      <p className="text-muted-foreground text-sm">
        Component{" "}
        <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm">
          {name}
        </code>{" "}
        not found in registry.
      </p>
    )
  }

  if (type === "block") {
    return (
      <div className="relative aspect-[4/2.5] w-full overflow-hidden rounded-md border md:-mx-1">
        <Image
          className="bg-background absolute top-0 left-0 z-20 w-[970px] max-w-none sm:w-[1280px] md:hidden dark:hidden md:dark:hidden"
          alt={name}
          height={900}
          src={`/r/styles/new-york-v4/${name}-light.png`}
          width={1440}
        />
        <Image
          className="bg-background absolute top-0 left-0 z-20 hidden w-[970px] max-w-none sm:w-[1280px] md:hidden dark:block md:dark:hidden"
          alt={name}
          height={900}
          src={`/r/styles/new-york-v4/${name}-dark.png`}
          width={1440}
        />
        <div className="bg-background absolute inset-0 hidden w-[1600px] md:block">
          {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
          <iframe className="size-full" src={`/view/${name}`} />
        </div>
      </div>
    )
  }

  return (
    <ComponentPreviewTabs
      className={className}
      align={align}
      component={<Component />}
      hideCode={hideCode}
      source={<ComponentSource name={name} collapsible={false} />}
      {...props}
    />
  )
}
