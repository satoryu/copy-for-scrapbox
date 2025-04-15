import React from 'react';
import { writeTextToClipboard } from '@/utils/clipboard';
import { getAllTabsOnCurrentWindow } from '@/utils/tabs';
import { createLinksForTabs } from '@/utils/link';

interface CopyAllTabsButtonProps {
  onCopied: (message: string) => void;
}

const CopyAllTabsButton: React.FC<CopyAllTabsButtonProps> = ({ onCopied }) => {
  const handleClick = () => {
    getAllTabsOnCurrentWindow()
      .then(createLinksForTabs)
      .then(writeTextToClipboard)
      .then(() => onCopied('Copied All Tabs!'))
      .catch(err => console.error(err));
  };

  return (
    <button onClick={handleClick}>
      Copy All Tabs
    </button>
  );
};

export default CopyAllTabsButton;