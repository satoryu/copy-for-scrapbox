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

  const name = browser.i18n.getMessage('copySelectedTabsButtonName');
  const message = browser.i18n.getMessage('copySelectedTabsMessage');

  const handleClick = () => {
    getSelectedTabs()
      .then(createLinksForTabs)
      .then(writeTextToClipboard)
      .then(() => onCopied(message))
      .catch(err => console.error(err));
  };

  return (
    <button onClick={handleClick}>
      {name} ({selectedTabsCount})
    </button>
  );
};

export default CopySelectedTabsButton;