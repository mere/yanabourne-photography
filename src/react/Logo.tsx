import { Arc } from "./Arc";
import { Circle } from "./Circle";

import { useEffect, useState, useRef } from "react";

type LogoSize = "S" | "M" | "L";

interface LogoProps {
  size?: LogoSize;
  fixed?: boolean;
}

const SIZE_CONFIG = {
  S: {
    main: 200,
    radius: 65,
    fontSize: 14,
    strokeWidth: 10,
    overlaySize: 107,
    textArc: {
      startDeg: 165,
      endDeg: 400,
    },
    dashArc: {
      startDeg: 0,
      endDeg: 152,
    },
  },
  M: {
    main: 250,
    radius: 85,
    fontSize: 12,
    strokeWidth: 8,
    overlaySize: 150,
    textArc: {
      startDeg: 165,
      endDeg: 400,
    },
    dashArc: {
      startDeg: 0,
      endDeg: 152,
    },
  },
  L: {
    main: 300,
    radius: 100,
    fontSize: 14,
    strokeWidth: 10,
    overlaySize: 180,
    textArc: {
      startDeg: 165,
      endDeg: 400,
    },
    dashArc: {
      startDeg: 0,
      endDeg: 152,
    },
  },
} as const;

const LOGO_COLOR = "#EEEEEE";
const LOGO_DOT_COLOR = "#EE0000";

const Logo = ({ size = "S", fixed = false }: LogoProps) => {
  const [rotation, setRotation] = useState(0);
  const targetRotation = useRef(0);
  const animationFrameId = useRef<number | undefined>(undefined);

  const config = SIZE_CONFIG[size];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Rotate 1 degree for every 10 pixels scrolled
      targetRotation.current = scrollPosition / 10;
    };

    const animate = () => {
      // Smoothly interpolate between current rotation and target rotation
      setRotation((prevRotation) => {
        const diff = targetRotation.current - prevRotation;
        // Use a smaller factor (0.1) for smoother movement
        return prevRotation + diff * 0.1;
      });
      animationFrameId.current = requestAnimationFrame(animate);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <a href="/">
        <svg
          width={config.main}
          height={config.main}
          viewBox={`${-config.main / 2 - 15} ${-config.main / 2 - 15} ${
            config.main + 30
          } ${config.main + 30}`}
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: fixed ? "fixed" : "absolute",
            top: 0,
            left: 0,
            transform: `rotate(${rotation}deg)`,
            transition: "transform 0.05s ease-out",
          }}
          className="z-9995 mix-blend-difference"
        >
          <defs>
            <Arc
              radius={config.radius}
              startDeg={config.textArc.startDeg}
              endDeg={config.textArc.endDeg}
              stroke={LOGO_COLOR}
              strokeWidth={config.strokeWidth}
              fill="none"
              id="circlePath"
            />
          </defs>

          <text
            fontFamily="Arial, sans-serif"
            fontSize={config.fontSize}
            fill={LOGO_COLOR}
          >
            <textPath href="#circlePath" startOffset="0%">
              YANA BOURNE PHOTOGRAPHY
            </textPath>
          </text>

          <Arc
            radius={config.radius + 5}
            startDeg={config.dashArc.startDeg}
            endDeg={config.dashArc.endDeg}
            stroke={LOGO_COLOR}
            strokeWidth={config.strokeWidth}
            strokeDasharray="19 0"
            fill="none"
          />

          <Circle
            radius={config.radius + 5}
            angle={160}
            r={config.strokeWidth / 2.5}
            fill={LOGO_DOT_COLOR}
          />
        </svg>
        <svg
          width={config.main}
          height={config.main}
          viewBox={`${-config.main / 2 - 15} ${-config.main / 2 - 15} ${
            config.main + 30
          } ${config.main + 30}`}
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: fixed ? "fixed" : "absolute",
            top: 0,
            left: 0,
            transform: `rotate(${rotation}deg)`,
            transition: "transform 0.05s ease-out",
          }}
          className="z-9999 "
        >
          <Circle
            radius={config.radius + 5}
            angle={160}
            r={config.strokeWidth / 2.5}
            fill={LOGO_DOT_COLOR}
          />
        </svg>
      </a>

      {/* <div
        className="
          _lens-component
          fixed
          z-9998
          rounded-full
          backdrop-contrast-120 backdrop-hue-rotate-60
          opacity-50
          _hidden
          
        "
        style={{
          width: `${config.overlaySize}px`,
          height: `${config.overlaySize}px`,
          left: `${config.main / 2 - config.overlaySize / 2}px`,
          top: `${config.main / 2 - config.overlaySize / 2}px`,
          transform: `rotate(${rotation / 5}deg)`,
          transition: "transform 0.05s ease-out",
        }}
      /> */}
    </div>
  );
};

export default Logo;
