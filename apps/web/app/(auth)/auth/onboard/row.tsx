import React from 'react'

const Row = ({k, v}: {k: string, v: string}) => {
 return (
    <div className="flex justify-between border-b last:border-0 border-border/60 py-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}

export default Row