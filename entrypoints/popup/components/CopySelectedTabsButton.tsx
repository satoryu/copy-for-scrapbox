import React, { useState, useEffect } from 'react';
import { writeTextToClipboard } from '@/utils/clipboard';
import { getSelectedTabs } from '@/utils/tabs';
import { createLinksForTabs } from '@/utils/link';

interface CopySelectedTabsButtonProps {
  onCopied: (message: string) => void;
}

const CopySelectedTabsButton: React.FC<CopySelectedTabsButtonProps> = ({ onCopied }) => {
  const [selectedTabsCount, setSelectedTabsCount] = useState<number>(0);

  useEffect(() => {
    // Get the count of selected tabs on initial load
    getSelectedTabs().then(tabs => {
      setSelectedTabsCount(tabs.length);
    });
  }, []);

  const handleClick = () => {
    getSelectedTabs()
      .then(createLinksForTabs)
      .then(writeTextToClipboard)
      .then(() => onCopied('Copied Selected Tabs!'))
      .catch(err => console.error(err));
  };

  return (
    <button onClick={handleClick}>
      Copy Selected Tabs ({selectedTabsCount})
    </button>
  );
};

export default CopySelectedTabsButton;