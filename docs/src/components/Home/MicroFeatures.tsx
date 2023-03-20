import 'twin.macro';
import React from 'react';
import CheckSvg from './check.svg';

const microFeatures = [
  '40+ Packages',
  'Design System',
  'Context-less',
  'State Management',
  'Automatic Garbage Collection',
  'Multiple Editors',
  'Editor Plugins',
  'Elements',
  'Marks',
  'Queries',
  'Transforms',
  'Normalizers',
  'Serializers',
  'Tree shakeable',
  'TypeScript Types',
];

const Check = ({ children }) => (
  <span tw="mb-2">
    <span tw="bg-blue-500 dark:bg-darkBlue text-gray-800 w-4 h-4 mr-2 rounded-full inline-flex items-center justify-center">
      <CheckSvg tw="w-3 h-3" />
    </span>
    {children}
  </span>
);

export const MicroFeatures = () => {
  return (
    <div tw="py-24 px-4 sm:px-6 lg:px-8 mx-auto container max-w-[1400px]">
      <div tw="sm:text-center pb-16">
        <h3 tw="text-3xl mx-auto leading-tight font-extrabold tracking-tight text-white sm:text-4xl lg:leading-none mt-2">
          One Dep, All the Features.
        </h3>
        <p tw="mt-4 text-xl max-w-3xl mx-auto leading-7 text-gray-300 dark:text-gray-300">
          Plate is strategically packed with features you're bound to need in
          almost any editor, tidying up the elements, marks, serializers,
          normalizers, queries, transforms, components, and many complex
          behaviors.
        </p>
      </div>
      <div>
        <div tw="grid grid-flow-row grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-4 text-white max-w-screen-lg mx-auto text-lg">
          {microFeatures.map((feature) => (
            <Check key={feature}>{feature}</Check>
          ))}
        </div>
      </div>
    </div>
  );
};
