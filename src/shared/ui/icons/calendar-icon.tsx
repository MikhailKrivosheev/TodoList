import type { SVGProps } from 'react';

function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M3 4.5h10v8.5H3zM3 7.5h10M5.75 3v3M10.25 3v3" />
    </svg>
  );
}

export default CalendarIcon;
