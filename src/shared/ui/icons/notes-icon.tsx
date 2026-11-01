import type { SVGProps } from 'react';

function NotesIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M3.5 4.5h9M3.5 8h9M3.5 11.5h5.5" />
    </svg>
  );
}

export default NotesIcon;
