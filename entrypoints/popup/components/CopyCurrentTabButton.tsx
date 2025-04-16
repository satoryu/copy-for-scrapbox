import React from 'react';
import { writeTextToClipboard } from '@/utils/clipboard';
import { getCurrentTab } from '@/utils/tabs';
import { createLinkForTab } from '@/utils/link';

interface CopyCurrentTabButtonProps {
  onCopied: (message: string) => void;
}

const CopyCurrentTabButton: React.FC<CopyCurrentTabButtonProps> = ({ onCopied }) => {
  const name = browser.i18n.getMessage('copyCurrentTabButtonName');
  const message = browser.i18n.getMessage('copyCurrentTabMessage');
  const handleClick = () => {
    getCurrentTab()
      .then(([tab]) => createLinkForTab(tab))
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

export default CopyCurrentTabButton;