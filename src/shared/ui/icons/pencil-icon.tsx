import type { SVGProps } from 'react';

function PencilIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M10.5 3.5 12.5 5.5M3 13l.6-2.6L10.5 3.5l2 2-6.9 6.9z" />
    </svg>
  );
}

export default PencilIcon;
