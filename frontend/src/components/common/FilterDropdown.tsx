import React from 'react';

export interface FilterOption {
  value: string | number;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string | number;
  onChange: (value: string) => void;
  className?: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
        {label}:
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full py-2 pl-3 pr-10 text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
      >
        {!options.some((o) => o.value === '') && <option value="">Tất cả</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterDropdown;
