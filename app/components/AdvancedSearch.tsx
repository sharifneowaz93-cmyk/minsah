'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice, convertUSDtoBDT } from '@/utils/currency';
import type {
  Product,
  Filter,
  SortOption,
  SearchHistory,
  SuggestionItem,
  Category,
  SearchState,
  VoiceSearchState,
  AdvancedSearchProps
} from '@/types/search';
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  Package,
  Star,
  Flower,
  Droplets,
  Brush,
  Volume2,
  VolumeX,
  Filter as FilterIcon,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

// Pre-defined beauty product suggestions
const BEAUTY_SUGGESTIONS: SuggestionItem[] = [
  { id: '1', text: 'lipstick', type: 'product', icon: <Brush className="w-4 h-4" />, count: 45 },
  { id: '2', text: 'foundation', type: 'product', icon: <Package className="w-4 h-4" />, count: 38 },
  { id: '3', text: 'mascara', type: 'product', icon: <Star className="w-4 h-4" />, count: 42 },
  { id: '4', text: 'makeup', type: 'category', icon: <Brush className="w-4 h-4" />, count: 156 },
  { id: '5', text: 'skincare', type: 'category', icon: <Droplets className="w-4 h-4" />, count: 89 },
  { id: '6', text: 'perfume', type: 'category', icon: <Flower className="w-4 h-4" />, count: 67 },
  { id: '7', text: 'haircare', type: 'category', icon: <Package className="w-4 h-4" />, count: 78 },
  { id: '8', text: 'nail polish', type: 'product', icon: <Star className="w-4 h-4" />, count: 35 },
];

// Sort options
const SORT_OPTIONS: SortOption[] = [
  { value: 'name', label: 'Name', direction: 'asc' },
  { value: 'price', label: 'Price: Low to High', direction: 'asc' },
  { value: 'price', label: 'Price: High to Low', direction: 'desc' },
  { value: 'rating', label: 'Rating', direction: 'desc' },
  { value: 'newest', label: 'Newest', direction: 'desc' },
];

export default function AdvancedSearch({
  products = [],
  categories = [],
  onSearch,
  onProductClick,
  className = '',
  placeholder = 'Search beauty products...',
  showFilters = true,
  showVoiceSearch = true,
  showHistory = true,
  maxResults = 20,
  historyLimit = 5,
  debounceMs = 300
}: AdvancedSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Search state
  const [searchState, setSearchState] = useState<SearchState>({
    query: searchParams.get('q') || '',
    filters: {
      category: searchParams.get('category') || undefined,
      priceMin: searchParams.get('min') ? Number(searchParams.get('min')) : undefined,
      priceMax: searchParams.get('max') ? Number(searchParams.get('max')) : undefined,
      inStock: searchParams.get('stock') === 'true',
    },
    sort: SORT_OPTIONS[0],
    results: [],
    suggestions: [],
    history: [],
    isLoading: false,
    error: null,
    hasSearched: false,
  });

  // Voice search state
  const [voiceState, setVoiceState] = useState<VoiceSearchState>({
    isListening: false,
    isSupported: typeof window !== 'undefined' && 'webkitSpeechRecognition' in window,
    error: null,
    language: 'en-US',
  });

  // UI state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Load search history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedHistory = localStorage.getItem('searchHistory');
        if (savedHistory) {
          const parsed = JSON.parse(savedHistory);
          setSearchState(prev => ({ ...prev, history: parsed }));
        }
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    }
  }, []);

  // Update URL with search parameters
  const updateURL = useCallback((query: string, filters: Filter, sort: SortOption) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (filters.category) params.set('category', filters.category);
    if (filters.priceMin) params.set('min', filters.priceMin.toString());
    if (filters.priceMax) params.set('max', filters.priceMax.toString());
    if (filters.inStock) params.set('stock', 'true');

    const url = params.toString() ? `/shop?${params.toString()}` : '/shop';
    router.push(url, { scroll: false });
  }, [router]);

  // Save search to history
  const saveToHistory = useCallback((term: string, resultCount: number) => {
    try {
      const newHistory: SearchHistory[] = [
        { term, timestamp: new Date(), resultCount },
        ...searchState.history.filter(h => h.term !== term).slice(0, historyLimit - 1)
      ];

      setSearchState(prev => ({ ...prev, history: newHistory }));
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }, [searchState.history, historyLimit]);

  // Clear search history
  const clearHistory = useCallback(() => {
    try {
      setSearchState(prev => ({ ...prev, history: [] }));
      localStorage.removeItem('searchHistory');
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  }, []);

  // Filter and sort products
  const filteredResults = useMemo(() => {
    let filtered = [...products];

    // Filter by query
    if (searchState.query.trim()) {
      const query = searchState.query.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.subcategory?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (searchState.filters.category) {
      filtered = filtered.filter(product => product.category === searchState.filters.category);
    }

    if (searchState.filters.priceMin !== undefined) {
      filtered = filtered.filter(product => product.price >= searchState.filters.priceMin!);
    }

    if (searchState.filters.priceMax !== undefined) {
      filtered = filtered.filter(product => product.price <= searchState.filters.priceMax!);
    }

    if (searchState.filters.inStock !== undefined) {
      filtered = filtered.filter(product => product.inStock === searchState.filters.inStock);
    }

    if (searchState.filters.rating !== undefined) {
      filtered = filtered.filter(product => (product.rating || 0) >= searchState.filters.rating!);
    }

    // Sort results
    filtered.sort((a, b) => {
      const { value, direction } = searchState.sort;

      switch (value) {
        case 'name':
          return direction === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);

        case 'price':
          return direction === 'asc'
            ? a.price - b.price
            : b.price - a.price;

        case 'rating':
          return direction === 'asc'
            ? (a.rating || 0) - (b.rating || 0)
            : (b.rating || 0) - (a.rating || 0);

        case 'newest':
          // Assuming newer products have higher IDs
          return direction === 'asc'
            ? a.id.localeCompare(b.id)
            : b.id.localeCompare(a.id);

        default:
          return 0;
      }
    });

    return filtered.slice(0, maxResults);
  }, [products, searchState.query, searchState.filters, searchState.sort, maxResults]);

  // Get suggestions
  const getSuggestions = useCallback((query: string) => {
    if (!query.trim()) {
      return BEAUTY_SUGGESTIONS.slice(0, 5);
    }

    const queryLower = query.toLowerCase();
    const filtered = BEAUTY_SUGGESTIONS.filter(suggestion =>
      suggestion.text.toLowerCase().includes(queryLower) ||
      suggestion.text.toLowerCase().startsWith(queryLower)
    ).slice(0, 5);

    // Add history matches
    const historyMatches = searchState.history
      .filter(h => h.term.toLowerCase().includes(queryLower))
      .slice(0, 3)
      .map((h, index) => ({
        id: `history-${index}`,
        text: h.term,
        type: 'history' as const,
        icon: <Clock className="w-4 h-4" />,
        count: h.resultCount
      }));

    return [...filtered, ...historyMatches].slice(0, 5);
  }, [searchState.history]);

  // Perform search with debouncing
  const performSearch = useCallback((query: string) => {
    setSearchState(prev => ({
      ...prev,
      query,
      isLoading: true,
      error: null,
      hasSearched: true
    }));

    // Update suggestions
    setSearchState(prev => ({
      ...prev,
      suggestions: getSuggestions(query)
    }));

    // Simulate API delay
    setTimeout(() => {
      setSearchState(prev => ({
        ...prev,
        results: filteredResults,
        isLoading: false
      }));

      if (query.trim() && filteredResults.length > 0) {
        saveToHistory(query, filteredResults.length);
      }

      updateURL(query, searchState.filters, searchState.sort);
      onSearch?.(query, searchState.filters, searchState.sort);
    }, 100);
  }, [filteredResults, getSuggestions, saveToHistory, updateURL, searchState.filters, searchState.sort, onSearch]);

  // Debounced search
  const debouncedSearch = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, debounceMs);
  }, [performSearch, debounceMs]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchState(prev => ({ ...prev, query: value }));
    setShowSuggestions(true);
    debouncedSearch(value);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SuggestionItem) => {
    setSearchState(prev => ({ ...prev, query: suggestion.text }));
    setShowSuggestions(false);
    performSearch(suggestion.text);
    inputRef.current?.focus();
  };

  // Handle voice search
  const startVoiceSearch = useCallback(() => {
    if (!voiceState.isSupported) {
      setVoiceState(prev => ({
        ...prev,
        error: 'Voice search is not supported in your browser'
      }));
      return;
    }

    try {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = voiceState.language;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setVoiceState(prev => ({ ...prev, isListening: true, error: null }));
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchState(prev => ({ ...prev, query: transcript }));
        performSearch(transcript);
        setVoiceState(prev => ({ ...prev, isListening: false }));
      };

      recognition.onerror = (event: any) => {
        setVoiceState(prev => ({
          ...prev,
          isListening: false,
          error: `Voice search error: ${event.error}`
        }));
      };

      recognition.onend = () => {
        setVoiceState(prev => ({ ...prev, isListening: false }));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      setVoiceState(prev => ({
        ...prev,
        isListening: false,
        error: 'Failed to start voice recognition'
      }));
    }
  }, [voiceState.isSupported, voiceState.language, performSearch]);

  // Stop voice search
  const stopVoiceSearch = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setVoiceState(prev => ({ ...prev, isListening: false }));
  }, []);

  // Handle filter changes
  const handleFilterChange = (filterName: keyof Filter, value: any) => {
    setSearchState(prev => ({
      ...prev,
      filters: { ...prev.filters, [filterName]: value }
    }));
  };

  // Handle sort change
  const handleSortChange = (sortOption: SortOption) => {
    setSearchState(prev => ({ ...prev, sort: sortOption }));
  };

  // Apply filters and sort
  const applyFilters = useCallback(() => {
    performSearch(searchState.query);
    setShowFiltersPanel(false);
  }, [performSearch, searchState.query]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      filters: {
        category: undefined,
        subcategory: undefined,
        priceMin: undefined,
        priceMax: undefined,
        inStock: undefined,
        rating: undefined
      }
    }));
    performSearch(searchState.query);
  }, [performSearch, searchState.query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestionIndex(prev =>
          prev < searchState.suggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestionIndex(prev =>
          prev > 0 ? prev - 1 : searchState.suggestions.length - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (searchState.suggestions[activeSuggestionIndex]) {
          handleSuggestionClick(searchState.suggestions[activeSuggestionIndex]);
        }
        break;

      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div className={`w-full max-w-6xl mx-auto ${className}`}>
      {/* Search Input Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="relative">
          {/* Search Input */}
          <div className="relative flex items-center">
            <div className="absolute left-3 flex items-center pointer-events-none">
              {searchState.isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              ) : (
                <Search className="h-5 w-5 text-gray-400" />
              )}
            </div>

            <input
              ref={inputRef}
              type="text"
              value={searchState.query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              placeholder={placeholder}
              className="w-full pl-10 pr-24 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              aria-label="Search products"
              role="searchbox"
              aria-expanded={showSuggestions}
              aria-autocomplete="list"
            />

            {/* Action Buttons */}
            <div className="absolute right-2 flex items-center gap-2">
              {showVoiceSearch && voiceState.isSupported && (
                <button
                  type="button"
                  onClick={voiceState.isListening ? stopVoiceSearch : startVoiceSearch}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    voiceState.isListening
                      ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  aria-label={voiceState.isListening ? 'Stop voice search' : 'Start voice search'}
                >
                  {voiceState.isListening ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
              )}

              {searchState.query && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchState(prev => ({ ...prev, query: '', results: [] }));
                    setShowSuggestions(false);
                  }}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all duration-300"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}

              {showFilters && (
                <button
                  type="button"
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all duration-300"
                  aria-label="Toggle filters"
                >
                  <FilterIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
              role="listbox"
            >
              {searchState.suggestions.length > 0 ? (
                <div className="py-2">
                  {searchState.suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-200 flex items-center gap-3 ${
                        index === activeSuggestionIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                      role="option"
                      aria-selected={index === activeSuggestionIndex}
                    >
                      <span className="text-xl flex-shrink-0">{suggestion.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{suggestion.text}</div>
                        <div className="text-sm text-gray-500 capitalize">{suggestion.type}</div>
                      </div>
                      {suggestion.count && (
                        <div className="text-sm text-gray-400">{suggestion.count} results</div>
                      )}
                    </button>
                  ))}
                </div>
              ) : searchState.query ? (
                <div className="p-4 text-center text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No suggestions found for "{searchState.query}"</p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Voice Search Error */}
        {voiceState.error && (
          <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-lg text-sm" role="alert">
            {voiceState.error}
          </div>
        )}

        {/* Search Error */}
        {searchState.error && (
          <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-lg text-sm" role="alert">
            {searchState.error}
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && showFiltersPanel && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={searchState.filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={searchState.filters.priceMin || ''}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-1/2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={searchState.filters.priceMax || ''}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-1/2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Stock Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
              <select
                value={searchState.filters.inStock === undefined ? '' : searchState.filters.inStock.toString()}
                onChange={(e) => handleFilterChange('inStock', e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Products</option>
                <option value="true">In Stock</option>
                <option value="false">Out of Stock</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={`${searchState.sort.value}-${searchState.sort.direction}`}
                onChange={(e) => {
                  const [value, direction] = e.target.value.split('-');
                  const option = SORT_OPTIONS.find(opt => opt.value === value && opt.direction === direction) || SORT_OPTIONS[0];
                  handleSortChange(option);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={`${option.value}-${option.direction}`} value={`${option.value}-${option.direction}`}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-300"
            >
              Clear All
            </button>
            <button
              onClick={() => setShowFiltersPanel(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search History */}
      {showHistory && searchState.history.length > 0 && !searchState.query && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Recent Searches</h3>
            <button
              onClick={clearHistory}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-300"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchState.history.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick({ id: `history-${index}`, text: item.term, type: 'history' })}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors duration-300 flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                {item.term}
                <span className="text-gray-400 text-xs">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Section */}
      {searchState.hasSearched && (
        <div className="bg-white rounded-lg shadow-md p-4">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {searchState.query
                ? `Search Results for "${searchState.query}"`
                : 'All Products'
              }
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredResults.length} results)
              </span>
            </h2>

            {/* Quick Sort */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort:</span>
              {['name', 'price', 'rating'].map((sortValue) => (
                <button
                  key={sortValue}
                  onClick={() => handleSortChange({
                    ...SORT_OPTIONS.find(opt => opt.value === sortValue)!,
                    direction: searchState.sort.value === sortValue && searchState.sort.direction === 'asc' ? 'desc' : 'asc'
                  })}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors duration-300 ${
                    searchState.sort.value === sortValue
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {sortValue.charAt(0).toUpperCase() + sortValue.slice(1)}
                  {searchState.sort.value === sortValue && (
                    <span className="ml-1">
                      {searchState.sort.direction === 'asc' ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Results Grid */}
          {filteredResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredResults.map((product) => {
                const bdtPrice = convertUSDtoBDT(product.price);
                const bdtOriginalPrice = product.originalPrice ? convertUSDtoBDT(product.originalPrice) : undefined;
                const discount = product.originalPrice
                  ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                  : 0;

                return (
                  <div
                    key={product.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => onProductClick?.(product)}
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <Brush className="w-16 h-16 text-pink-400" />
                      </div>
                      {discount > 0 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          -{discount}%
                        </div>
                      )}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white font-semibold">Out of Stock</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          {product.category}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      {/* Rating */}
                      {product.rating && (
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(product.rating!)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300 fill-current'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 ml-1">
                            {product.rating.toFixed(1)}
                          </span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-blue-600">
                            {formatPrice(bdtPrice)}
                          </span>
                          {bdtOriginalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              {formatPrice(bdtOriginalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* No Results */
            <div className="text-center py-12">
              <Search className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search terms or filters
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
