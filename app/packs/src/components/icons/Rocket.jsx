import React from 'react';

const Rocket = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 16 16"
    {...props}
  >
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 1.045l-1.439.16a5 5 0 00-2.983 1.434L4.04 9.177l2.827 2.828 6.539-6.538a4.996 4.996 0 001.434-2.984L15 1.045zM4.04 9.177L1.625 8.37a.5.5 0 01-.195-.827l.155-.155a4 4 0 014.093-.966l.837.278L4.04 9.177z"
    ></path>
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.04 9.177L1.625 8.37a.5.5 0 01-.195-.827l.155-.155a4 4 0 014.093-.966l.837.278L4.04 9.177zM6.867 12.005l.805 2.414a.499.499 0 00.827.196l.156-.155a4 4 0 00.966-4.093l-.278-.834-2.476 2.472z"
    ></path>
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.867 12.005l.805 2.414a.499.499 0 00.827.196l.156-.155a4 4 0 00.966-4.093l-.278-.834-2.476 2.472zM5.186 12.359a1.495 1.495 0 01-.44 1.06c-.585.586-3.533 1.414-3.533 1.414s.829-2.95 1.414-3.533c.257-.258.6-.413.963-.437"
    ></path>
  </svg>
);

export default Rocket;