import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';

interface AutocompleteInputProps extends Omit<React.ComponentProps<"input">, 'onSelect'> {
  suggestions: string[];
  onSuggestionSelect?: (value: string) => void;
}

export const AutocompleteInput = React.forwardRef<HTMLInputElement, AutocompleteInputProps>(
  ({ className, suggestions, value, onChange, onSuggestionSelect, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const inputValue = String(value || '');

    // Filter suggestions based on input (case-insensitive, partial match)
    const filteredSuggestions = React.useMemo(() => {
      if (inputValue.length < 2) return [];
      const search = inputValue.toLowerCase();
      return suggestions
        .filter(s => s.toLowerCase().includes(search))
        .slice(0, 5); // Max 5 suggestions
    }, [inputValue, suggestions]);

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      setIsOpen(true);
      setHighlightedIndex(-1);
    };

    const handleSuggestionSelect = (suggestion: string) => {
      const syntheticEvent = {
        target: { name: props.name, value: suggestion }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(syntheticEvent);
      onSuggestionSelect?.(suggestion);
      setIsOpen(false);
      setHighlightedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || filteredSuggestions.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
      } else if (e.key === 'Enter' && highlightedIndex >= 0) {
        e.preventDefault();
        handleSuggestionSelect(filteredSuggestions[highlightedIndex]);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const showDropdown = isOpen && filteredSuggestions.length > 0;

    return (
      <div ref={wrapperRef} className="relative">
        <Input
          ref={ref}
          className={className}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue.length >= 2 && setIsOpen(true)}
          autoComplete="off"
          {...props}
        />
        {showDropdown && (
          <ul className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-48 overflow-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <li
                key={suggestion}
                className={cn(
                  "px-3 py-2 cursor-pointer text-sm",
                  index === highlightedIndex
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                )}
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

AutocompleteInput.displayName = 'AutocompleteInput';
