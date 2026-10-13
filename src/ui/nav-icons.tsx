import { SVGProps } from "react";

export function ShelfIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4 3v18M20 3v18M4 8h16M4 15h16M3 21h18" />
      <path d="M7 5v3M11 4v4M8 11v4M12 10v5M16 11v4M7 18v3M11 17v4M16 18v3" />
    </svg>
  );
}
