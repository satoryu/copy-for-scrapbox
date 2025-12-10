import React from 'react';
import { getMessage } from '../utils/i18n';

export const EmptyState: React.FC = () => {
  return (
    <div className="empty-state">
      <p>{getMessage('sidepanelEmpty', 'No clipboard history yet')}</p>
    </div>
  );
};
