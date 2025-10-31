import React, { useState, useEffect, useRef } from 'react';
import { Input } from './Input';

interface AutocompleteInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  suggestions: string[];
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ suggestions, value, onChange, ...props }) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userInput = e.currentTarget.value;
    const newFilteredSuggestions = suggestions.filter(
      suggestion => suggestion.toLowerCase().includes(userInput.toLowerCase()) && suggestion.toLowerCase() !== userInput.toLowerCase()
    );
    
    setFilteredSuggestions(newFilteredSuggestions);
    setShowSuggestions(true);
    if (onChange) {
        onChange(e);
    }
  };

  const onSuggestionClick = (suggestion: string) => {
    if (onChange) {
        const event = {
            target: { ...props, value: suggestion },
            currentTarget: { ...props, value: suggestion },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
    }
    setShowSuggestions(false);
  };
  
  return (
    <div className="relative" ref={wrapperRef}>
      <Input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputChange}
        autoComplete="off"
        {...props}
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 max-h-60 overflow-y-auto bg-slate-700 border border-slate-600 rounded-md mt-1 z-20 shadow-lg">
            {filteredSuggestions.map((suggestion, index) => (
                <li
                    key={suggestion + index}
                    onClick={() => onSuggestionClick(suggestion)}
                    className="px-3 py-2 cursor-pointer hover:bg-cyan-600 text-white"
                >
                    {suggestion}
                </li>
            ))}
        </ul>
      )}
    </div>
  );
};