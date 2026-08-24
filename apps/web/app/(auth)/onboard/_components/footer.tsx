import React from 'react'

const Footer = ({left, right}: {left?: React.ReactNode, right?: React.ReactNode}) => {
  return (
    <div className="mt-10 pt-6 border-t flex items-center justify-between gap-3">
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

export default Footer