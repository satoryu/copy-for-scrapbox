import React, { useState } from 'react';
import CopyCurrentTabButton from './components/CopyCurrentTabButton';
import CopySelectedTabsButton from './components/CopySelectedTabsButton';
import CopyAllTabsButton from './components/CopyAllTabsButton';

const App: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);

  const appendMessage = (message: string) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };

  return (
    <div className="container">
      <div id="message-box">
        {messages.map((message, index) => (
          <p key={index}>{message}</p>
        ))}
      </div>

      <CopyCurrentTabButton onCopied={appendMessage} />
      <CopySelectedTabsButton onCopied={appendMessage} />
      <CopyAllTabsButton onCopied={appendMessage} />
    </div>
  );
};

export default App;