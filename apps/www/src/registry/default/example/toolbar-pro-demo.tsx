import { PRO_HOST } from '../../../config/potion-components';

export default function ToolbarProDemo() {
  return (
    <iframe
      className="size-full h-[350px]"
      src={`${PRO_HOST}/iframe/toolbar`}
      title="toolbar"
    ></iframe>
  );
}
