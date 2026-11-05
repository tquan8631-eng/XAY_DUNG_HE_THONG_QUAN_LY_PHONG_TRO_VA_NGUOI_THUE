import React, { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Inbox size={48} className="text-gray-300" />,
  title,
  description,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-gray-200 border-dashed rounded-lg">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="mb-1 text-lg font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="max-w-sm mb-6 text-sm text-gray-500">{description}</p>
      )}
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
