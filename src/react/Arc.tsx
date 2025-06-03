import React from "react";

export function getArcPath(radius: number, startDeg: number, endDeg: number) {
  function degToRad(deg: number) {
    return (deg * Math.PI) / 180;
  }
  const startRad = degToRad(startDeg);
  const endRad = degToRad(endDeg);
  const x1 = radius * Math.cos(startRad);
  const y1 = radius * Math.sin(startRad);
  const x2 = radius * Math.cos(endRad);
  const y2 = radius * Math.sin(endRad);
  const delta = (endDeg - startDeg + 360) % 360;
  const largeArcFlag = delta > 180 ? 1 : 0;
  const sweepFlag = 1;
  return `M ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},${sweepFlag} ${x2},${y2}`;
}

interface ArcProps extends React.SVGProps<SVGPathElement> {
  radius: number;
  startDeg: number;
  endDeg: number;
}

export const Arc: React.FC<ArcProps> = ({
  radius,
  startDeg,
  endDeg,
  ...props
}) => {
  const d = getArcPath(radius, startDeg, endDeg);
  return <path d={d} {...props} />;
};
