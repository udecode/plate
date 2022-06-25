import React from 'react';

function buildScript(src, attrs = {}) {
  if (typeof document !== 'undefined') {
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    Object.keys(attrs).forEach((attr) =>
      script.setAttribute(attr, attrs[attr])
    );
    script.src = src;

    return script;
  }
}

export const CarbonAds = () => {
  const ref = React.useRef<any>();

  React.useEffect(() => {
    const script = buildScript(
      '//cdn.carbonads.com/carbon.js?serve=CESI4K3I&placement=plateudecodeio',
      {
        type: 'text/javascript',
        id: '_carbonads_js',
      }
    );

    ref.current.appendChild(script);
  }, []);

  return <div ref={ref} />;
};
