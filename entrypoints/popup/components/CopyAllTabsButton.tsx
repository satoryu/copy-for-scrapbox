import React from 'react';
import { writeTextToClipboard } from '@/utils/clipboard';
import { getAllTabsOnCurrentWindow } from '@/utils/tabs';
import { createLinksForTabs } from '@/utils/link';

interface CopyAllTabsButtonProps {
  onCopied: (message: string) => void;
}

const CopyAllTabsButton: React.FC<CopyAllTabsButtonProps> = ({ onCopied }) => {
  const name = browser.i18n.getMessage('copyAllTabsButtonName');
  const message = browser.i18n.getMessage('copyAllTabsMessage');
  const handleClick = () => {
    getAllTabsOnCurrentWindow()
      .then(createLinksForTabs)
      .then(writeTextToClipboard)
      .then(() => onCopied(message))
      .catch(err => console.error(err));
  };

  return (
    <button onClick={handleClick}>
      {name}
    </button>
  );
};

export default CopyAllTabsButton;