import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import type { SearchResult } from "../types/search";
import { capitalizeFirstLetter, getIdFromUrl } from "../utils";

const SearchPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  const query = params.get("q") || "";

  const fetch = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`http://localhost:3000/search?q=${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setResults(res.data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!query) return;

    fetch();
  }, [query]);

  const availableTypes = useMemo(() => {
    const types = results.map((r) => r.category);
    return ["all", ...Array.from(new Set(types))];
  }, [results]);

  const filteredResults =
    selectedFilter === "all"
      ? results
      : results.filter((group) => group.category === selectedFilter);

  return (
    <div className="px-2 py-8">
      <button
        onClick={() => navigate(-1)}
        className="text-[#fade4b] hover:underline cursor-pointer mb-4 block"
      >
        ← Back to home
      </button>
      <h2 className="text-xl font-bold mb-4">Results for "{query}"</h2>
      {loading && <p>Searching results...</p>}
      <div className="flex justify-flex-start items-center gap-2 my-4">
        <label htmlFor="type-select" className="font-medium mb-1">
          Filter by type:
        </label>
        <select
          id="type-select"
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 w-[160px]"
        >
          {availableTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {filteredResults.map((group) => (
        <div key={group.category} className="mb-6">
          <h3 className="font-semibold">
            {capitalizeFirstLetter(group.category)}
          </h3>
          <ul className="list-disc list-inside ml-4 mt-1">
            {group.results.length === 0 && selectedFilter !== "all" ? (
              <span className="italic text-gray-500">No result</span>
            ) : (
              group.results.map((result, i) => (
                <li key={i}>
                  <Link
                    to={`/search/details/${group.category}/${getIdFromUrl(
                      result?.url
                    )}`}
                    className="hover:text-[#fade4b] underline decoration-solid"
                  >
                    {result.name || result.title}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default SearchPage;
