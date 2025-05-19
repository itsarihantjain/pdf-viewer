import { useEffect, useRef, useCallback, useMemo } from "react";
import { useAppStore } from "../store";
import { HIGHLIGHT_COLORS, ACTIVE_HIGHLIGHT_COLORS, SearchMatch } from '../constants';

interface TextHighlighterProps {
  searchQuery: string;
  pageIndex: number;
  currentMatchIndex: number;
}

const TextHighlighter = ({
  searchQuery,
  pageIndex,
  currentMatchIndex,
}: TextHighlighterProps) => {
  const { searchMatches, setSearchMatches } = useAppStore();
  const highlighterRef = useRef<HTMLDivElement>(null);
  const textLayerRef = useRef<HTMLElement | null>(null);
  const prevMatchesRef = useRef<SearchMatch[]>([]);

  const searchTerms = useMemo(() => {
    return searchQuery
      .toLowerCase()
      .split(",")
      .map((term) => term.trim())
      .filter((term) => term.length > 0);
  }, [searchQuery]);

  const updateHighlights = useCallback(() => {
    if (!highlighterRef.current) return;

    if (!textLayerRef.current) {
      textLayerRef.current =
        highlighterRef.current.parentElement?.querySelector(
          ".react-pdf__Page__textContent"
        ) as HTMLElement;
    }

    if (!textLayerRef.current) return;

    const oldHighlights =
      textLayerRef.current.querySelectorAll(".highlight-search");
    oldHighlights.forEach((el) => el.remove());

    if (!searchQuery.trim()) {
      const otherPageMatches = searchMatches.filter(
        (match) => match.pageIndex !== pageIndex
      );
      if (otherPageMatches.length !== searchMatches.length) {
        setSearchMatches(otherPageMatches);
      }
      return;
    }

    if (searchTerms.length === 0) {
      const otherPageMatches = searchMatches.filter(
        (match) => match.pageIndex !== pageIndex
      );
      if (otherPageMatches.length !== searchMatches.length) {
        setSearchMatches(otherPageMatches);
      }
      return;
    }

    const textNodes = textLayerRef.current.querySelectorAll("span");
    const newMatches: SearchMatch[] = [];
    let matchCount = 0;

    textNodes.forEach((node) => {
      const text = node.textContent || "";
      const lowerCaseText = text.toLowerCase();

      searchTerms.forEach((searchTerm, termIndex) => {
        if (lowerCaseText.includes(searchTerm)) {
          const rect = node.getBoundingClientRect();
          const layerRect = textLayerRef.current!.getBoundingClientRect();

          let startIndex = 0;
          while (true) {
            const index = lowerCaseText.indexOf(searchTerm, startIndex);
            if (index === -1) break;

            const textWidth = node.getBoundingClientRect().width;
            const charWidth = textWidth / text.length;
            const matchWidth = searchTerm.length * charWidth;
            const offsetLeft = index * charWidth;

            const highlightEl = document.createElement("div");
            highlightEl.className = "highlight-search absolute";
            highlightEl.style.left = `${rect.left - layerRect.left + offsetLeft
              }px`;
            highlightEl.style.top = `${rect.top - layerRect.top}px`;
            highlightEl.style.width = `${matchWidth}px`;
            highlightEl.style.height = `${rect.height}px`;

            const colorIndex = termIndex % HIGHLIGHT_COLORS.length;
            highlightEl.style.backgroundColor = HIGHLIGHT_COLORS[colorIndex];
            highlightEl.style.pointerEvents = "none";

            newMatches.push({
              pageIndex,
              matchIndex: matchCount++,
              str: text.substring(index, index + searchTerm.length),
              termIndex,
            });

            const isCurrentMatch = searchMatches.length > 0 &&
              currentMatchIndex >= 0 &&
              currentMatchIndex < searchMatches.length &&
              searchMatches.some(
                (match) =>
                  match.pageIndex === pageIndex &&
                  match.matchIndex === matchCount - 1 &&
                  searchMatches.indexOf(match) === currentMatchIndex
              );

            if (isCurrentMatch) {
              highlightEl.style.backgroundColor =
                ACTIVE_HIGHLIGHT_COLORS[colorIndex];
              highlightEl.style.boxShadow = `0 0 0 2px ${ACTIVE_HIGHLIGHT_COLORS[
                colorIndex
              ].replace("0.5", "0.8")}`;

              setTimeout(() => {
                highlightEl.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }, 100);
            }

            textLayerRef.current!.appendChild(highlightEl);
            startIndex = index + searchTerm.length;
          }
        }
      });
    });

    const otherPageMatches = searchMatches.filter(
      (match) => match.pageIndex !== pageIndex
    );
    const newMatchesString = JSON.stringify(newMatches);
    const currentMatchesString = JSON.stringify(
      searchMatches.filter((match) => match.pageIndex === pageIndex)
    );

    if (newMatchesString !== currentMatchesString) {
      const updatedMatches = [...otherPageMatches, ...newMatches];
      prevMatchesRef.current = updatedMatches;
      setSearchMatches(updatedMatches);
    }
  }, [
    searchQuery,
    pageIndex,
    searchMatches,
    currentMatchIndex,
    setSearchMatches,
    searchTerms,
  ]);

  useEffect(() => {
    textLayerRef.current = null;

    const timeoutId = setTimeout(() => {
      updateHighlights();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [pageIndex, updateHighlights]);

  useEffect(() => {
    updateHighlights();
  }, [searchQuery, updateHighlights]);

  useEffect(() => {
    return () => {
      if (textLayerRef.current) {
        const oldHighlights = textLayerRef.current.querySelectorAll(".highlight-search");
        oldHighlights.forEach((el) => el.remove());
      }
    };
  }, [searchQuery]);

  return (
    <div ref={highlighterRef} className="sr-only">
      Text highlighter
    </div>
  );
};

export default TextHighlighter;
