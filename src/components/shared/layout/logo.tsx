import * as React from "react";

type LogoProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  size?: number | string;
};

export function Logo({ size = 24, ...props }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="PatternLab Logo"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      {...props}
    />
  );
}
