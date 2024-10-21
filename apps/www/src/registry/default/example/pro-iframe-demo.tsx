import { siteConfig } from '@/config/site';
import { cn } from '@/registry/default/lib/utils';

export default function ProIframeDemo({
  component,
}: {
  component: string;
  height: string;
}) {
  return (
    <iframe
      className={cn(`size-full h-[520px]`)}
      title={component}
      src={`${siteConfig.links.platePro}/iframe/${component}`}
    />
  );
}
