/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const imageValue: any = (
  <fragment>
    <hh2>图片</hh2>
    <hp>通过上传或提供图片 URL 来添加图片：</hp>
    <himg
      align="center"
      caption={[{ children: [{ text: '图片说明' }] }]}
      url="https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      width="55%"
    >
      <htext />
    </himg>
    <hp>自定义图片说明并调整图片大小。</hp>
  </fragment>
);

export const mediaPlaceholderValue: any = (
  <fragment>
    <hh2>上传</hh2>
    <hp>我们的编辑器支持多种媒体类型的上传，包括图片、视频、音频和文件。</hp>
    <hfile
      name="sample.pdf"
      align="center"
      url="https://s26.q4cdn.com/900411403/files/doc_downloads/test.pdf"
      width="80%"
      isUpload
    >
      <htext />
    </hfile>
    <hp indent={1} listStyleType="disc">
      实时上传状态和进度跟踪
    </hp>
    <haudio
      align="center"
      url="https://samplelib.com/lib/preview/mp3/sample-3s.mp3"
      width="80%"
    >
      <htext />
    </haudio>
    <hp indent={1} listStyleType="disc">
      可配置的文件大小限制和批量上传设置
    </hp>
    <hvideo
      align="center"
      url="https://videos.pexels.com/video-files/6769791/6769791-uhd_2560_1440_24fps.mp4"
      width="80%"
      isUpload
    >
      <htext />
    </hvideo>
    <hp indent={1} listStyleType="disc">
      清晰的上传错误提示信息
    </hp>
    <hp indent={1} listStyleType="disc">
      立即尝试 - 从桌面拖拽图片或点击工具栏中的上传按钮
    </hp>
  </fragment>
);

export const mediaValue: any = (
  <fragment>
    {imageValue}
    {mediaPlaceholderValue}

    <hh2>嵌入</hh2>
    <hp>嵌入各种类型的内容，如视频和推文：</hp>
    <hmediaembed
      align="center"
      url="https://www.youtube.com/watch?v=MyiBAziEWUA"
    >
      <htext />
    </hmediaembed>
    {/* BUG */}
    {/* <hmediaembed
      align="center"
      url="https://twitter.com/zbeyens/status/1677214892212776960"
    >
      <htext />
    </hmediaembed> */}
  </fragment>
);
