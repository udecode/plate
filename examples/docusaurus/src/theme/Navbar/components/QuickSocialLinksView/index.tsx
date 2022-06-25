import React from 'react';
import { FaGithub } from 'react-icons/fa';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import clsx from 'clsx';
import styles from './styles.module.css';

const QuickSocialLinksView = (props: { className?: string }): JSX.Element => {
  const { className } = props;
  const { siteConfig } = useDocusaurusContext();

  return (
    <div className={clsx(className, styles.IconContainer)}>
      <FaGithub
        className={styles.Icon}
        onClick={() => {
          window.open(siteConfig.customFields.githubUrl, '_blank');
        }}
      />
    </div>
  );
};

export default QuickSocialLinksView;
