import { PRO_HOST } from '../../../config/potion-components';

export default function ImageProDemo() {
  return (
    <iframe
      className="size-full h-[350px]"
      src={`${PRO_HOST}/iframe/media-controller`}
      title="media-controller"
    ></iframe>
  );
}
