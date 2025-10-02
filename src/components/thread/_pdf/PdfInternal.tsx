"use client";

import React from "react";

type Props = { url: string };

const PdfInternal: React.FC<Props> = ({ url }) => {
  return (
    <iframe
      title="document"
      src={`${url}#toolbar=0&view=FitH`}
      className="h-full w-full"
    />
  );
};

export default PdfInternal;
