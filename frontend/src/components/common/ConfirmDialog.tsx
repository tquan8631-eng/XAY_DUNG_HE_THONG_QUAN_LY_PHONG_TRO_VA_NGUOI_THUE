import React from 'react';
import Modal from './Modal';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose?: () => void;

  onCancel?: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose: onCloseProp,
  onCancel,
  onConfirm,
  title,
  message,
  type = 'danger',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  loading = false
}) => {
  const onClose = () => (onCloseProp || onCancel || (() => undefined))();

  const getIcon = () => {
    switch (type) {
      case 'danger': return <AlertCircle className="w-6 h-6 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'info': return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'danger': return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'warning': return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
      case 'info': return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  const getIconBgClass = () => {
    switch (type) {
      case 'danger': return 'bg-red-100';
      case 'warning': return 'bg-yellow-100';
      case 'info': return 'bg-blue-100';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận" size="md">
      <div className="flex items-start gap-4 mb-6">
        <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${getIconBgClass()}`}>
          {getIcon()}
        </div>
        <div className="mt-1">
          <h4 className="text-lg font-medium text-gray-900">{title}</h4>
          <p className="mt-2 text-sm text-gray-500 whitespace-pre-line">{message}</p>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${getButtonClass()}`}
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 mr-2 -ml-1 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang xử lý...
            </>
          ) : (
            confirmText
          )}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
