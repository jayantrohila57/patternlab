import * as React from "react";

type LogoProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
};

export function Logo({ size = 24, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 30"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth=".80"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* Neck */}
      <path
        d="
      M10 
      9H14
      V12
      H10Z
      "
      />

      {/* Container */}
      <path
        d="
        M16.8148 
        22H7.18524
           C6.53065 22 6 21.4693
            6 20.8148
           C6 20.6085 6.05383
            20.4058 6.15616 20.2267
           L10 12H14
           L17.8438 20.2267
           C17.9462 20.4058
            18 
            20.6085 
            18 20.8148
           C18 21.4693
            17.4693 22
            16.8148 22Z
            "
      />

      {/* Asterisk */}
      <path d="M12 15.3V18.3" />
      <path d="M10.7 16L13.3 17.6" />
      <path d="M13.3 16L10.7 17.6" />
    </svg>
  );
}
