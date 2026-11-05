import React from 'react';

export const inputCls =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100';

export const btn = {
  primary:
    'inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors',
  secondary:
    'inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors',
  danger:
    'inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors',
  success:
    'inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors',
  icon: 'p-1.5 rounded-md hover:bg-gray-100 transition-colors'
};

export const PageHeader: React.FC<{ title: string; subtitle?: string; actions?: React.ReactNode }> = ({ title, subtitle, actions }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);

export const Card: React.FC<{ title?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string }> = ({
  title,
  actions,
  children,
  className = ''
}) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
    {(title || actions) && (
      <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-gray-100">
        {title && <h2 className="text-base font-semibold text-gray-800">{title}</h2>}
        {actions}
      </div>
    )}
    <div className="p-5">{children}</div>
  </div>
);

export const Field: React.FC<{ label: string; required?: boolean; hint?: string; children: React.ReactNode; className?: string }> = ({
  label,
  required,
  hint,
  children,
  className = ''
}) => (
  <div className={className}>
    <label className="block mb-1 text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
  </div>
);

export const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between gap-4 py-2 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-medium text-right text-gray-900">{value ?? '-'}</span>
  </div>
);

export const FormActions: React.FC<{ onCancel: () => void; submitText?: string; loading?: boolean }> = ({
  onCancel,
  submitText = 'Lưu',
  loading
}) => (
  <div className="flex justify-end gap-3 pt-4 border-t">
    <button type="button" onClick={onCancel} className={btn.secondary}>
      Hủy
    </button>
    <button type="submit" disabled={loading} className={btn.primary}>
      {loading ? 'Đang lưu...' : submitText}
    </button>
  </div>
);

export const thangNamHienTai = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const ngayHomNay = (plusDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + plusDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
