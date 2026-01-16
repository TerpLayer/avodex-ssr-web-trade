import React, { HTMLAttributes, useMemo } from "react";

interface Props extends HTMLAttributes<HTMLOrSVGElement> {
  value?: string | number;
  max?: string | number;
  percent?: string | number; //[0,1]
}

const AzDashboard: React.FC<Props> = ({ value = 0, max = 100, percent }) => {
  const percentNum = useMemo(() => {
    try {
      let percentNum = +value / +max;
      if (percent || percent === 0) {
        percentNum = +percent;
      }

      if (percentNum < 0) return 0;
      if (percentNum > 1) return 1;
      return percentNum;
    } catch (e) {
      return 0;
    }
  }, [value, max, percent]);

  return (
    <svg viewBox="0 0 100 100" width="1em" height="1em">
      <g fill="none" strokeWidth="14" transform="translate(0,7.32)rotate(-45,50 50)">
        <path d="M7,50 A43,43 0 0 1 50 7" stroke="#5DC887" />
        <path d="M50,7 A43,43 0 0 1 93 50" stroke="#E7BB41" />
        <path d="M93,50 A43,43 0 0 1 50 93" stroke="#E35561" />

        <g stroke="#606672" strokeWidth="8" transform={`rotate(${270 * percentNum},50 50)`}>
          <circle cx="50" cy="50" r="12" />
          <line x1="0" y1="50" x2="40" y2="50" />
        </g>
      </g>
    </svg>
  );
};

export default AzDashboard;
