
import React from 'react';

interface IDEViewProps {
  url: string;
}

const IDEView: React.FC<IDEViewProps> = ({ url }) => {
  return (
    <div className="flex-1 w-full bg-[#1e1e1e] relative overflow-hidden">
      <iframe
        src={url}
        className="w-full h-full border-none"
        title="VS Code Cloud IDE"
        allow="clipboard-read; clipboard-write; fullscreen"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      />
    </div>
  );
};

export default IDEView;
