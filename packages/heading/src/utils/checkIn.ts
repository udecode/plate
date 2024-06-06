export function checkIn(
  e: React.MouseEvent<HTMLElement, globalThis.MouseEvent>
) {
  const event = window.event as unknown as React.MouseEvent<
    HTMLElement,
    globalThis.MouseEvent
  >;
  const x = Number(event.clientX); // 鼠标相对屏幕横坐标
  const y = Number(event.clientY); // 鼠标相对屏幕纵坐标

  const ele = e.target as HTMLElement;
  const div_x = Number(ele.getBoundingClientRect().left); // 相对屏幕的横坐标
  const div_x_width = Number(
    ele.getBoundingClientRect().left + ele.clientWidth
  ); // 相对屏幕的横坐标+width

  const div_y = Number(ele.getBoundingClientRect().top); // 相对屏幕的纵坐标
  const div_y_height = Number(
    ele.getBoundingClientRect().top + ele.clientHeight
  ); // 相对屏幕的纵坐标+height

  if (x > div_x && x < div_x_width && y > div_y && y < div_y_height) {
    return true;
  }

  return false;
}
