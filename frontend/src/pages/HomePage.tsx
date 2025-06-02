import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getIdFromUrl } from "../utils";
import type { SearchResult } from "../types/search";

const HomePage = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(false);

  const suggestionsRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleSelect = (type: string, id: string) => {
    navigate(`/search/details/${type}/${id}`);
  };

  const handleSearch = () => {
    if (debouncedInput.trim()) {
      navigate(`/search?q=${debouncedInput}`);
    }
  };

  const flatSuggestions = suggestions.flatMap((group) =>
    group.results.map((item: any) => ({
      name: item.name || item.title,
      id: getIdFromUrl(item.url),
      category: group.category,
    }))
  );

  // function to support keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!flatSuggestions.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < flatSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : flatSuggestions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0) {
        const selected = flatSuggestions[highlightIndex];
        navigate(`/search/details/${selected.category}/${selected.id}`);
      } else {
        handleSearch();
      }
    }
  };

  const fetchSuggestions = async () => {
    if (!debouncedInput.trim()) return setSuggestions([]);

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:3000/search?q=${debouncedInput}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuggestions(res.data.results);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
      setHighlightIndex(-1);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [debouncedInput]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedInput(input), 500);
    return () => clearTimeout(timer);
  }, [input]);

  // close suggestions when click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-2 pt-20">
      <h1 className="text-4xl font-bold mb-8">Search on SWAPI</h1>

      <div ref={wrapperRef} className="w-full max-w-md flex gap-4">
        <div className="relative w-full">
          <input
            type="text"
            className="border border-gray-300 rounded px-4 py-2 w-full max-w-md focus:outline-[#fade4b]"
            placeholder="Search for a character, a ship..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {debouncedInput.trim() && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 bg-[#070708] border border-t-0 rounded-b shadow-md max-h-60 overflow-y-auto z-10"
            >
              {loading && (
                <div className="px-4 py-2 text-gray-500 italic">Loading...</div>
              )}
              {!loading &&
                flatSuggestions.map((item, index) => (
                  <div
                    key={`${item.category}-${item.id}`}
                    onClick={() => handleSelect(item.category, item.id)}
                    className={`px-4 py-2 cursor-pointer border-t ${
                      index === highlightIndex
                        ? "bg-[#fade4b] text-black font-semibold"
                        : "hover:bg-gray-700"
                    }`}
                  >
                    <span className="font-medium">{item.name}</span>{" "}
                    <span className="text-gray-500 text-sm">
                      ({item.category})
                    </span>
                  </div>
                ))}
              {!loading &&
                suggestions.every((group) => group.results.length === 0) && (
                  <div className="px-4 py-2 text-gray-500 italic">
                    No results found
                  </div>
                )}
            </div>
          )}
        </div>

        <button
          onClick={handleSearch}
          className="bg-[#070708] text-[#fade4b] border font-semibold px-6 py-2 rounded cursor-pointer hover:bg-[#fade4b] hover:text-white"
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default HomePage;
