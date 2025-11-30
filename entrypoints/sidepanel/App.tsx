import React, { useState, useEffect } from 'react';
import { getHistory, type ClipboardHistoryItem } from '../../utils/history';

const App: React.FC = () => {
  const [history, setHistory] = useState<ClipboardHistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();

    // Listen for storage changes to update history in real-time
    const handleStorageChange = (changes: { [key: string]: browser.storage.StorageChange }) => {
      if (changes.clipboardHistory) {
        setHistory(changes.clipboardHistory.newValue || []);
      }
    };

    browser.storage.local.onChanged.addListener(handleStorageChange);

    return () => {
      browser.storage.local.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const loadHistory = async () => {
    const items = await getHistory();
    setHistory(items);
  };

  const handleCopy = async (item: ClipboardHistoryItem) => {
    try {
      await navigator.clipboard.writeText(item.text);
      setCopiedId(item.id);

      // Clear the feedback after 2 seconds
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return browser.i18n.getMessage('timeJustNow') || 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return browser.i18n.getMessage('timeMinutesAgo', [minutes.toString()]) || `${minutes} minutes ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return browser.i18n.getMessage('timeHoursAgo', [hours.toString()]) || `${hours} hours ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return browser.i18n.getMessage('timeDaysAgo', [days.toString()]) || `${days} days ago`;
    }
  };

  return (
    <div className="sidepanel-container">
      <h1 className="sidepanel-title">
        {browser.i18n.getMessage('sidepanelTitle') || 'Clipboard History'}
      </h1>

      {history.length === 0 ? (
        <div className="empty-state">
          <p>{browser.i18n.getMessage('sidepanelEmpty') || 'No clipboard history yet'}</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <div
              key={item.id}
              className={`history-item ${copiedId === item.id ? 'copied' : ''}`}
              onClick={() => handleCopy(item)}
            >
              <div className="history-text">{item.text}</div>
              <div className="history-timestamp">{formatTimestamp(item.timestamp)}</div>
              {copiedId === item.id && (
                <div className="copied-feedback">
                  {browser.i18n.getMessage('copiedFeedback') || 'Copied!'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
