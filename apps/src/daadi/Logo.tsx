import React from "react";

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <circle cx="12" cy="4" r="3" fill="currentColor" />
    <circle cx="4" cy="20" r="3" fill="currentColor" />
    <circle cx="20" cy="20" r="3" fill="currentColor" />
    <line x1="12" y1="7" x2="4" y2="17" strokeWidth="2" stroke="currentColor" />
    <line x1="12" y1="7" x2="20" y2="17" strokeWidth="2" stroke="currentColor" />
    <line x1="4" y1="20" x2="20" y2="20" strokeWidth="2" stroke="currentColor" />
  </svg>
);

export default Logo;
