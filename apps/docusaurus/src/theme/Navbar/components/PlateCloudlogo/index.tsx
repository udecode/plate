import React from 'react';

export const PlateCloudLogo = (props) => (
  <svg width={170} height={36} xmlns="http://www.w3.org/2000/svg" {...props}>
    <g fill="none" fillRule="evenodd">
      <rect fill="#3E96F5" y={6} width={170} height={26} rx={13} />
      <text
        fontFamily="Inter-SemiBold, Inter"
        fontSize={16}
        fontWeight={500}
        letterSpacing={-0.16}
        fill="#FFF"
      >
        <tspan x={12.5} y={25}>
          Plate Cloud
        </tspan>
      </text>
      <circle fill="#FFF" cx={117.853} cy={24.48} r={11.52} />
      <circle fill="#FFF" cx={147.113} cy={23.5} r={12.5} />
      <circle fill="#FFF" cx={129.053} cy={11.52} r={11.52} />
      <path fill="#FFF" d="M117.853 18h31v18h-31z" />
      <text
        fontFamily="Inter-Bold, Inter"
        fontSize={12}
        fontWeight="bold"
        letterSpacing={-0.12}
        fill="#3E96F5"
      >
        <tspan x={113.5} y={28}>
          Portive
        </tspan>
      </text>
      <text
        fontFamily="Inter-Bold, Inter"
        fontSize={10}
        fontWeight="bold"
        letterSpacing={-0.1}
        fill="#3E96F5"
      >
        <tspan x={124.5} y={16}>
          by
        </tspan>
      </text>
      <path fill="#3E96F5" d="M0 19h13v13H0z" />
    </g>
  </svg>
);
