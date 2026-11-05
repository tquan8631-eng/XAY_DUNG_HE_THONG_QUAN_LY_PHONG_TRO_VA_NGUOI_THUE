import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(value);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== value) {
        onChange(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onChange, value]);

  const handleClear = () => {
    setSearchTerm('');
    onChange('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search size={18} className="text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full py-2 pl-10 pr-10 text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBox;
