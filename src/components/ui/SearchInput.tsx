import { useState, useEffect } from 'react';

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  debounceMs?: number;
}

export const SearchInput = ({ placeholder = 'Search...', value, onChange, debounceMs = 300 }: SearchInputProps) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [localValue, debounceMs, value, onChange]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="relative flex items-center bg-surface-container-lowest px-3.5 py-2.5 rounded shadow-sm focus-within:shadow focus-within:ring-1 focus-within:ring-primary transition-all">
      <span className="material-symbols-outlined text-[18px] text-outline mr-2">search</span>
      <input 
        className="bg-transparent font-body-sm text-body-sm text-on-surface outline-none w-48 lg:w-64 placeholder:text-outline" 
        placeholder={placeholder}
        type="text" 
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
      {localValue && (
        <button 
          onClick={handleClear}
          className="absolute right-10 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      )}
      <kbd className="hidden sm:inline-block font-label-sm text-label-sm bg-surface-container px-1.5 py-0.5 rounded text-on-surface-variant font-medium ml-2">⌘K</kbd>
    </div>
  );
};
