import React from 'react';
import { writeTextToClipboard } from '@/utils/clipboard';
import { getCurrentTab } from '@/utils/tabs';
import { createLinkForTab } from '@/utils/link';

interface CopyCurrentTabButtonProps {
  onCopied: (message: string) => void;
}

const CopyCurrentTabButton: React.FC<CopyCurrentTabButtonProps> = ({ onCopied }) => {
  const handleClick = () => {
    getCurrentTab()
      .then(([tab]) => createLinkForTab(tab))
      .then(writeTextToClipboard)
      .then(() => onCopied('Copied!'))
      .catch(err => console.error(err));
  };

  return (
    <button onClick={handleClick}>
      Copy Current Tab
    </button>
  );
};

export default CopyCurrentTabButton;