import React, { useState, useRef } from "react";

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, any>;
}

interface AddressAutocompleteProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string, coords?: { lat: number; lon: number; raw?: AddressSuggestion }) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ id, name, value, onChange, placeholder, className, inputClassName }) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (e) {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setShowSuggestions(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 400);
  };

  const handleSelect = (suggestion: AddressSuggestion) => {
    onChange(suggestion.display_name, {
      lat: parseFloat(suggestion.lat),
      lon: parseFloat(suggestion.lon),
      raw: suggestion
    });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className={"relative " + (className || "") }>
      <input
        id={id}
        name={name}
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder || "Saisir une adresse"}
        className={
          inputClassName ||
          "w-full rounded-md border px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition"
        }
        autoComplete="off"
        onFocus={() => value && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 left-0 right-0 bg-white border rounded shadow mt-1 max-h-56 overflow-auto">
          {suggestions.map((s, idx) => (
            <li
              key={s.display_name + idx}
              className="px-3 py-2 cursor-pointer hover:bg-accent/20 text-sm"
              onMouseDown={() => handleSelect(s)}
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
      {loading && <div className="absolute right-2 top-2 text-xs text-muted-foreground">Chargement…</div>}
    </div>
  );
}; 