import localFont from 'next/font/local';

export const fontSans = localFont({
  display: 'swap',
  src: [
    {
      path: '../assets/fonts/Inter-Regular.ttf',
      style: 'normal',
      weight: '400',
    },
    {
      path: '../assets/fonts/Inter-Bold.ttf',
      style: 'normal',
      weight: '700',
    },
  ],
  variable: '--font-sans',
});

export const fontMono = localFont({
  display: 'swap',
  src: [
    {
      path: '../assets/fonts/GeistMonoVF.woff',
      style: 'normal',
      weight: '100 900',
    },
  ],
  variable: '--font-mono',
});
