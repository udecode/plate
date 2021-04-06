import '../css/tailwind.output.css';
import React from 'react';
import Layout from '@theme/Layout';
import { HomeContent } from '../components/Home/HomeContent';

export default function Home() {
  return (
    <Layout
      title="Slate Plugins - Rich text editor plugin system"
      description="A plugin framework for building rich text editors with slate."
    >
      <HomeContent />
    </Layout>
  );
}
