import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useAppStore } from "../store";
import { useSearchParams } from "react-router-dom";
import { SearchMatch, HIGHLIGHT_COLORS, escapeRegExp } from '../constants';

function highlightSearchTerm(text: string, searchQuery: string) {
  if (!searchQuery) return text;

  const searchTerms = searchQuery
    .toLowerCase()
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean);

  const escapedTerms = searchTerms.map(escapeRegExp);

  const regex = new RegExp(`(${escapedTerms.join("|")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const termIndex = searchTerms.findIndex(
          (term) => part.toLowerCase() === term
        );
        return termIndex >= 0 ? (
          <mark
            key={i}
            style={{
              backgroundColor:
                HIGHLIGHT_COLORS[termIndex % HIGHLIGHT_COLORS.length],
            }}
          >
            {part}
          </mark>
        ) : (
          part
        );
      })}
    </>
  );
}

const Sidebar = () => {
  const {
    file,
    searchQuery,
    setSearchQuery,
    searchMatches,
    setSearchMatches,
    currentMatchIndex,
    setCurrentMatchIndex,
    setCurrentPage,
    setSidebarOpen,
  } = useAppStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const [isSearching, setIsSearching] = useState(false);

  const clearSearch = () => {
    setSearchQuery("");
    setSearchMatches([]);
    setCurrentMatchIndex(-1);
    setSearchParams({});

    setCurrentPage(1);

    requestAnimationFrame(() => {
      const pageOneElement = document.querySelector('[data-page-number="1"]');
      if (pageOneElement) {
        pageOneElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  useEffect(() => {
    const query = searchParams.get("q");
    if (query && searchQuery === "") {
      setSearchQuery(query);
    }
  }, [searchParams, setSearchQuery]);

  useEffect(() => {
    if (searchQuery) {
      setSearchParams({ q: searchQuery });
    } else {
      setSearchParams({});
      window.history.replaceState({}, '', window.location.pathname);
      setCurrentPage(1);
      requestAnimationFrame(() => {
        const pageOneElement = document.querySelector('[data-page-number="1"]');
        if (pageOneElement) {
          pageOneElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }, [searchQuery, setSearchParams, setCurrentPage]);

  useEffect(() => {
    if (currentMatchIndex >= 0 && searchMatches.length > 0 && currentMatchIndex < searchMatches.length) {
      const match = searchMatches[currentMatchIndex];
      if (match) {
        setCurrentPage(match.pageIndex + 1);
      }
    }
  }, [currentMatchIndex, searchMatches, setCurrentPage]);

  const searchText = async () => {
    if (!file || !searchQuery.trim()) {
      setSearchMatches([]);
      return;
    }

    setIsSearching(true);

    try {
      const arrayBuffer = await file.arrayBuffer();

      const pdfjsLib = await import("pdfjs-dist");
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const matches: SearchMatch[] = [];

      for (let pageIndex = 0; pageIndex < pdf.numPages; pageIndex++) {
        const page = await pdf.getPage(pageIndex + 1);
        const textContent = await page.getTextContent();

        const items = textContent.items as { str: string }[];

        const searchTerms = searchQuery
          .toLowerCase()
          .split(",")
          .map((term) => term.trim());

        items.forEach((item, matchIndex) => {
          const text = item.str.toLowerCase();
          searchTerms.forEach((term, termIndex) => {
            if (text.includes(term)) {
              matches.push({
                pageIndex,
                matchIndex,
                str: item.str,
                termIndex
              });
            }
          });
        });
      }

      setSearchMatches(matches);
      if (matches.length > 0) {
        setCurrentMatchIndex(0);
      } else {
        setCurrentMatchIndex(-1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      searchText();
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery, file]);

  return (
    <div className="w-72 md:w-80 h-full bg-gray-50 flex flex-col shadow-lg md:shadow-none border-r-4 border-gray-100">
      <div className="p-3 md:p-4 border-b border-gray-100 bg-white">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={file ? "Search in document" : "Open a PDF file to search"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={!file}
            className={`bg-gray-50 w-full pl-10 pr-4 py-2 text-sm md:text-base rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-200 text-gray-800 ${!file && 'opacity-50 cursor-not-allowed'}`}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X
                size={16}
                className="text-gray-400 hover:text-gray-600"
              />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isSearching ? (
          <div className="p-4 text-center">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Searching...</p>
          </div>
        ) : searchMatches.length > 0 ? (
          <>
            <div className="p-3 border-b border-gray-100 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {searchMatches.length} results
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {searchMatches.map((match, index) => (
                <button
                  key={`${match.pageIndex}-${match.matchIndex}`}
                  onClick={() => {
                    if (index >= 0 && index < searchMatches.length) {
                      setCurrentMatchIndex(index);
                    }
                  }}
                  className={`w-full p-3 md:p-4 text-left hover:bg-gray-50 transition-colors ${index === currentMatchIndex ? 'bg-gray-50' : ''}`}
                >
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500">
                      Page {match.pageIndex + 1}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                      Match {index + 1}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {highlightSearchTerm(match.str, searchQuery)}
                  </p>
                </button>
              ))}
            </div>
          </>
        ) : searchQuery ? (
          <div className="p-4 text-center text-gray-500 text-sm md:text-base">
            No matches found
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500 text-sm md:text-base">
            {file ? "Enter search terms above with commas separated for multiple terms." : "Open a PDF file to start"}
          </div>
        )}
      </div>

      {file && (
        <div className="p-3 md:p-4 border-t border-gray-100 bg-white">
          <p className="truncate text-sm font-medium text-gray-700">
            {file.name}
          </p>
          <p className="text-xs text-gray-500">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
