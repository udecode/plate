import 'twin.macro';
import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.scss';

const macroFeatures = [
  {
    title: 'Declarative & Familiar',
    description: (
      <>
        Plate takes care of the repetitive and annoying stuff so you don't have
        to. This means you spend less time wiring up your editor features and
        more time focusing on your business logic with minimal slate knowledge.
      </>
    ),
  },
  {
    title: 'Pluggable & Functional',
    description: (
      <>
        A plugin system allows you to easily enable additional functionality,
        and package your own plugins in a common format. Tons of queries and
        transforms are provided to create your own plugins, and confidently
        implement complex behavior.
      </>
    ),
  },
  // {
  //   title: 'Centralized Configuration & State',
  //   description: (
  //     <>
  //       A store is used to handle multiple editor out of the box. You can
  //       configure all your elements and marks in a single place.
  //     </>
  //   ),
  // },
  {
    title: 'Plate Cloud: Image and Attachment uploads',
    description: (
      <>
        New! Plate introduces its official cloud image and attachment upload
        service with image resizing. Quickly add upload support to any Plate
        editor and support your favorite editor.
      </>
    ),
  },
];

const Feature = ({ imageUrl, title, description }: any) => {
  const imgUrl = useBaseUrl(imageUrl);

  return (
    <div className="col col--4">
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3 tw="text-xl leading-6 xl:text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p tw="text-base xl:text-lg lg:leading-normal leading-6 text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </div>
  );
};

export const MacroFeatures = () => {
  return (
    macroFeatures &&
    macroFeatures.length > 0 && (
      <section tw="border-gray-50 bg-gray-50 dark:bg-gray-850 flex items-center w-full text-lg border-t">
        <div tw="container py-24 mx-auto px-4">
          <div className="row">
            {macroFeatures.map((props, idx) => (
              <Feature key={idx} {...props} />
            ))}
          </div>
        </div>
      </section>
    )
  );
};
