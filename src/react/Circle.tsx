interface CircleProps {
  radius: number;
  angle: number;
  r: number;
  fill?: string;
  className?: string;
}

export const Circle = ({
  radius,
  angle,
  r,
  fill = "white",
  className = "",
}: CircleProps) => {
  // Convert polar coordinates to cartesian
  const cx = radius * Math.cos((angle * Math.PI) / 180);
  const cy = radius * Math.sin((angle * Math.PI) / 180);

  return <circle cx={cx} cy={cy} r={r} fill={fill} className={className} />;
};
