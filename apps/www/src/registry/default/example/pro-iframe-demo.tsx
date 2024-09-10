import { PRO_HOST } from '../../../config/potion-components';

export default function ProIframeDemo({ component }: { component: string }) {
  return (
    <iframe
      className="size-full h-[350px]"
      src={`${PRO_HOST}/iframe/${component}`}
      title={component}
    ></iframe>
  );
}
