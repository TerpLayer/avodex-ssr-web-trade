import React, { SVGAttributes } from "react";

const Transfer: React.FC<SVGAttributes<any>> = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path
        d="M30.0074 12V7.5H6.00732V12H30.0074ZM30.0074 15H6.00732V28.5H30.0074V15ZM4.50732 4.5H31.5074C32.3358 4.5 33.0074 5.17158 33.0074 6V30C33.0074 30.8284 32.3358 31.5 31.5074 31.5H4.50732C3.6789 31.5 3.00732 30.8284 3.00732 30V6C3.00732 5.17158 3.6789 4.5 4.50732 4.5Z"
        fill="var(--az-colorv2-text-primary)"
      />
      <path d="M9.75729 21H18.7573V17.25L25.5073 24H9.75729V21Z" fill="var(--az-colorv2-brand-primary)" />
    </svg>
  );
};

export default Transfer;
