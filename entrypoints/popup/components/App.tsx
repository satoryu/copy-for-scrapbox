import React, { useState, useEffect } from 'react';
import { writeTextToClipboard } from '@/utils/clipboard';
import { getCurrentTab, getSelectedTabs, getAllTabsOnCurrentWindow } from '@/utils/tabs';
import { createLinkForTab, createLinksForTabs } from '@/utils/link';

const App: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [selectedTabsCount, setSelectedTabsCount] = useState<number>(0);

  useEffect(() => {
    // Get the count of selected tabs on initial load
    getSelectedTabs().then(tabs => {
      setSelectedTabsCount(tabs.length);
    });
  }, []);

  const appendMessage = (message: string) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };

  const handleCopyCurrentTab = () => {
    getCurrentTab()
      .then(([tab]) => createLinkForTab(tab))
      .then(writeTextToClipboard)
      .then(() => appendMessage('Copied!'))
      .catch(err => console.error(err));
  };

  const handleCopySelectedTabs = () => {
    getSelectedTabs()
      .then(createLinksForTabs)
      .then(writeTextToClipboard)
      .then(() => appendMessage('Copied Selected Tabs!'))
      .catch(err => console.error(err));
  };

  const handleCopyAllTabs = () => {
    getAllTabsOnCurrentWindow()
      .then(createLinksForTabs)
      .then(writeTextToClipboard)
      .then(() => appendMessage('Copied All Tabs!'))
      .catch(err => console.error(err));
  };

  return (
    <div className="container">
      <div id="message-box">
        {messages.map((message, index) => (
          <p key={index}>{message}</p>
        ))}
      </div>

      <button onClick={handleCopyCurrentTab}>
        Copy Current Tab
      </button>

      <button onClick={handleCopySelectedTabs}>
        Copy Selected Tabs ({selectedTabsCount})
      </button>

      <button onClick={handleCopyAllTabs}>
        Copy All Tabs
      </button>
    </div>
  );
};

export default App;