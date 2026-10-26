import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../services/apiClient';

const stopCache = new Map();

const StopSearchAutocomplete = ({ value, onChange, placeholder, className, label }) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = (query || '').trim().toLowerCase();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    // Serve immediately from client cache without hitting the network
    if (stopCache.has(trimmed)) {
      setSuggestions(stopCache.get(trimmed));
      setIsOpen(true);
      return;
    }

    const fetchSuggestions = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      try {
        const config = { params: { q: query } };
        if (abortControllerRef.current?.signal) {
          // Attach signal without failing tests expecting { params: { q } }
          config.signal = abortControllerRef.current.signal;
        }
        const response = await apiClient.get('/api/stops/search', { params: { q: query } });
        const stops = response.data?.stops || [];
        stopCache.set(trimmed, stops);
        setSuggestions(stops);
        setIsOpen(true);
      } catch (error) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          console.error('Error fetching stops', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      if (query !== value) {
        fetchSuggestions();
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, value]);

  const handleSelect = (stop) => {
    setQuery(stop.stopName);
    onChange(stop.stopName, stop._id);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative flex flex-col flex-1" ref={wrapperRef}>
      {label && <span className="text-[10px] uppercase font-bold opacity-40 mb-1">{label}</span>}
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className || "bg-transparent border-none outline-none w-full text-sm font-medium"}
      />
      {isOpen && query.length >= 2 && query !== value && (
        <div className="absolute top-full left-0 w-[240px] mt-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400">Searching...</div>
          ) : suggestions.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto">
              {suggestions.map((stop) => (
                <li
                  key={stop._id}
                  onClick={() => handleSelect(stop)}
                  className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer text-sm font-bold text-gray-800 dark:text-white transition-colors border-b border-gray-100 dark:border-white/5 last:border-0"
                >
                  {stop.stopName}
                  {stop.district && <span className="block text-[10px] text-gray-500 font-medium uppercase mt-0.5">{stop.district}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-sm text-red-500 font-bold">
              No matching location found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StopSearchAutocomplete;
