import { siteConfig } from '../../../config/site';

export default function ImageProDemo() {
  return (
    <iframe
      className="size-full h-[350px]"
      src={`${siteConfig.links.platePro}/iframe/media-controller`}
      title="media-controller"
    ></iframe>
  );
}
