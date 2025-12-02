import React from 'react';
import { type ClipboardHistoryItem } from '../../utils/history';
import { getMessage } from './utils/i18n';
import { useClipboardHistory } from './hooks/useClipboardHistory';
import { useCopyToClipboard } from './hooks/useCopyToClipboard';
import { EmptyState } from './components/EmptyState';
import { HistoryItem } from './components/HistoryItem';

const App: React.FC = () => {
  const history = useClipboardHistory();
  const { copiedId, copyToClipboard } = useCopyToClipboard();

  const handleCopy = (item: ClipboardHistoryItem) => {
    copyToClipboard(item.id, item.text);
  };


  return (
    <div className="sidepanel-container">
      <h1 className="sidepanel-title">
        {getMessage('sidepanelTitle', 'Clipboard History')}
      </h1>

      {history.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              isCopied={copiedId === item.id}
              onCopy={handleCopy}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
