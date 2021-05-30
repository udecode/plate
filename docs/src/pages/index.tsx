import React, { useEffect } from 'react';
import useThemeContext from '@theme/hooks/useThemeContext';
import Layout from '@theme/Layout';
import { HomeContent } from '../components/Home/HomeContent';
import { GlobalStyles } from '../styles/GlobalStyles';

const initTheme = () => {
  // On page load or when changing themes, best to add inline in `head` to avoid FOUC
  if (
    localStorage.theme === 'dark' ||
    (!('theme' in localStorage) &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const Content = () => {
  const { isDarkTheme } = useThemeContext();

  useEffect(() => {
    localStorage.theme = isDarkTheme ? 'dark' : 'light';
    initTheme();
  }, [isDarkTheme]);

  return <HomeContent />;
};

export default function Home() {
  return (
    <Layout description="A plugin framework for building rich text editors with slate.">
      <GlobalStyles />
      <Content />
    </Layout>
  );
}
