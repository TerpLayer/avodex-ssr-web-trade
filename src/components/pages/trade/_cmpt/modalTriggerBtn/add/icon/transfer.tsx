import React, { SVGAttributes } from "react";

const Transfer: React.FC<SVGAttributes<any>> = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="28" viewBox="0 0 30 28" fill="none">
      <mask id="path-1-inside-1_2_13291" fill="var(--az-colorv2-text-primary)">
        <rect width="30" height="28" rx="2" />
      </mask>
      <rect width="30" height="28" rx="2" stroke="var(--az-colorv2-text-primary)" stroke-width="6" />
      <path d="M7.12497 8.89569H16.125V5.14569L22.875 11.8957H7.12497V8.89569Z" fill="var(--az-colorv2-brand-primary)" />
      <path d="M22.875 19.043H13.875V22.793L7.125 16.043H22.875V19.043Z" fill="var(--az-colorv2-brand-primary)" />
    </svg>
  );
};

export default Transfer;
