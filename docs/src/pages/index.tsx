import '../css/tailwind.output.css';
import React from 'react';
import useThemeContext from '@theme/hooks/useThemeContext';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import { HomeContent } from '../components/Home/HomeContent';

const Content = () => {
  const { isDarkTheme } = useThemeContext();

  return (
    <div id="tailwind">
      <div className={clsx({ dark: isDarkTheme })}>
        <HomeContent />
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <Layout description="A plugin framework for building rich text editors with slate.">
      <Content />
    </Layout>
  );
}
