import { siteConfig } from '../../../config/site';

export default function ProIframeDemo({ component }: { component: string }) {
  return (
    <iframe
      className="size-full h-[350px]"
      src={`${siteConfig.links.platePlus}/iframe/${component}`}
      title={component}
    ></iframe>
  );
}
