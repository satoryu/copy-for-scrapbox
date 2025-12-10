import React from 'react';
import { type ClipboardHistoryItem } from '../../../utils/history';
import { formatTimestamp } from '../utils/formatTimestamp';
import { getMessage } from '../utils/i18n';

interface HistoryItemProps {
  item: ClipboardHistoryItem;
  isCopied: boolean;
  onCopy: (item: ClipboardHistoryItem) => void;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ item, isCopied, onCopy }) => {
  return (
    <div
      className={`history-item ${isCopied ? 'copied' : ''}`}
      onClick={() => onCopy(item)}
    >
      <div className="history-text">{item.text}</div>
      <div className="history-timestamp">{formatTimestamp(item.timestamp)}</div>
      {isCopied && (
        <div className="copied-feedback">
          {getMessage('copiedFeedback', 'Copied!')}
        </div>
      )}
    </div>
  );
};
