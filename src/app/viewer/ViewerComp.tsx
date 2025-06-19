"use client";

import dynamic from "next/dynamic";

const TifyViewer = dynamic(() =>
  import('./tify'),
  { ssr: false }
);

function ViewerComp({manifestUrl, iiifPage}: {manifestUrl: string, iiifPage: number}) {
  return (
    <TifyViewer iiifPage={iiifPage} manifestUrl={manifestUrl} />
  )
}

export default ViewerComp