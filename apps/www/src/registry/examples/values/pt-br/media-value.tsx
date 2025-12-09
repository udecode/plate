/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const imageValue: any = (
  <fragment>
    <hh2>Imagem</hh2>
    <hp>Adicione imagens fazendo upload ou fornecendo a URL da imagem:</hp>
    <himg
      align="center"
      caption={[{ children: [{ text: 'Legenda da imagem' }] }]}
      url="https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      width="55%"
    >
      <htext />
    </himg>
    <hp>Personalize legendas de imagens e redimensione imagens.</hp>
  </fragment>
);

export const mediaPlaceholderValue: any = (
  <fragment>
    <hh2>Upload</hh2>
    <hp>
      Nosso editor suporta vários tipos de mídia para upload, incluindo imagens,
      vídeos, áudio e arquivos.
    </hp>
    <hfile
      name="exemplo.pdf"
      align="center"
      url="https://s26.q4cdn.com/900411403/files/doc_downloads/test.pdf"
      width="80%"
      isUpload
    >
      <htext />
    </hfile>
    <hp indent={1} listStyleType="disc">
      Status de upload em tempo real e rastreamento de progresso
    </hp>
    <haudio
      align="center"
      url="https://samplelib.com/lib/preview/mp3/sample-3s.mp3"
      width="80%"
    >
      <htext />
    </haudio>
    <hp indent={1} listStyleType="disc">
      Limites de tamanho de arquivo configuráveis e configurações de upload em lote
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
      Mensagens de erro claras para quaisquer problemas de upload
    </hp>
    <hp indent={1} listStyleType="disc">
      Experimente agora - arraste uma imagem da sua área de trabalho ou clique no botão de upload na
      barra de ferramentas
    </hp>
  </fragment>
);

export const mediaValue: any = (
  <fragment>
    {imageValue}
    {mediaPlaceholderValue}

    <hh2>Incorporar (Embed)</hh2>
    <hp>Incorpore vários tipos de conteúdo, como vídeos e tweets:</hp>
    <hmediaembed
      align="center"
      url="https://www.youtube.com/watch?v=MyiBAziEWUA"
    >
      <htext />
    </hmediaembed>
  </fragment>
);
