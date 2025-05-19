import { useCallback, useEffect, useRef } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useAppStore } from '../store';
import Sidebar from './Sidebar';
import PdfControls from './PdfControls';
import TextHighlighter from './TextHighlighter';

const PdfViewer = () => {
  const {
    file,
    numPages,
    setNumPages,
    scale,
    searchQuery,
    searchMatches,
    currentMatchIndex,
    setCurrentMatchIndex,
    sidebarOpen,
    currentPage,
    setCurrentPage,
  } = useAppStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    pageRefs.current = Array(numPages).fill(null);
  };

  useEffect(() => {
    if (!file) return;

    let scrollTimeout: NodeJS.Timeout;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        let maxVisibility = 0;
        let mostVisiblePage = currentPage;

        entries.forEach((entry) => {
          const pageNumber = parseInt(entry.target.getAttribute('data-page-number') || '1');
          const visibility = entry.intersectionRatio;

          if (visibility > maxVisibility) {
            maxVisibility = visibility;
            mostVisiblePage = pageNumber;
          }
        });

        if (maxVisibility > 0.5) {
          if (scrollTimeout) clearTimeout(scrollTimeout);

          scrollTimeout = setTimeout(() => {
            if (mostVisiblePage !== currentPage) {
              setCurrentPage(mostVisiblePage);
            }
          }, 50);
        }
      },
      {
        root: containerRef.current,
        threshold: Array.from({ length: 20 }, (_, i) => i * 0.05),
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    pageRefs.current.forEach((ref) => {
      if (ref) {
        observerRef.current?.observe(ref);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [file, currentPage, setCurrentPage]);

  useEffect(() => {
    if (currentMatchIndex >= 0 && searchMatches.length > 0) {
      const match = searchMatches[currentMatchIndex];
      setCurrentPage(match.pageIndex + 1);

      setTimeout(() => {
        const pageDiv = pageRefs.current[match.pageIndex];
        if (pageDiv) {
          pageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const textLayer = pageDiv.querySelector('.react-pdf__Page__textContent');
          if (textLayer) {
            textLayer.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 150);
    }
  }, [currentMatchIndex, searchMatches, setCurrentPage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F3' || (e.ctrlKey && e.key === 'g')) {
        e.preventDefault();
        if (searchMatches.length > 0) {
          setCurrentMatchIndex((currentMatchIndex + 1) % searchMatches.length);
        }
      }
      else if ((e.shiftKey && e.key === 'F3') || (e.ctrlKey && e.shiftKey && e.key === 'G')) {
        e.preventDefault();
        if (searchMatches.length > 0) {
          setCurrentMatchIndex((currentMatchIndex - 1 + searchMatches.length) % searchMatches.length);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentMatchIndex, searchMatches.length, setCurrentMatchIndex]);

  useEffect(() => {
    const targetPage = document.querySelector(`[data-page-number="${currentPage}"]`);
    if (targetPage && !searchQuery) {
      targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage, searchQuery]);

  const setPageRef = useCallback((index: number) => (ref: HTMLDivElement | null) => {
    pageRefs.current[index] = ref;
  }, []);

  return (
    <div className="flex flex-1 h-full overflow-hidden bg-gray-50 relative">
      <div className={`${sidebarOpen ? 'block' : 'hidden'} absolute md:relative z-20 h-full`}>
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => useAppStore.getState().toggleSidebar()}
        />
      )}

      <div className="flex-1 flex flex-col w-full">
        <PdfControls />

        <div
          ref={containerRef}
          className="flex-1 overflow-auto bg-gray-50 flex justify-center p-2 md:p-6"
        >
          {file ? (
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              className="flex flex-col items-center w-full"
              loading={
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="spinner w-12 h-12 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading PDF...</p>
                  </div>
                </div>
              }
              error={
                <div className="text-center text-gray-800 mt-10">
                  <p className="text-xl font-semibold">Error loading PDF</p>
                  <p className="mt-2 text-gray-600">Please try another document</p>
                </div>
              }
            >
              {Array.from(new Array(numPages), (_, index) => (
                <div
                  key={`page-container-${index + 1}`}
                  className="mb-8 w-full max-w-5xl mx-auto px-3 md:px-6"
                  ref={setPageRef(index)}
                  data-page-number={index + 1}
                  style={{
                    display: searchQuery || index + 1 === currentPage ? 'block' : 'none'
                  }}
                >
                  <Page
                    pageNumber={index + 1}
                    scale={scale}
                    className="shadow-lg bg-gray-50 rounded-lg w-full"
                    width={window.innerWidth - (sidebarOpen ? 380 : 120)}
                    loading={
                      <div className="w-full aspect-[1/1.4] bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
                      </div>
                    }
                  >
                    {searchQuery && (
                      <TextHighlighter
                        searchQuery={searchQuery}
                        pageIndex={index}
                        currentMatchIndex={currentMatchIndex}
                      />
                    )}
                  </Page>
                </div>
              ))}
            </Document>
          ) : (
            <div className="flex items-center justify-center h-full w-full px-4">
              <div className="text-center max-w-md p-6 md:p-8 bg-gray-50 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">Welcome to PDF Viewer</h2>
                <p className="text-gray-600 mb-8">
                  Upload a PDF file to get started. You'll be able to view pages, search for text, and navigate through the document.
                </p>
                <label className="inline-block px-4 md:px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-white font-medium cursor-pointer">
                  <span>Choose a PDF file</span>
                  <input
                    type="file"
                    accept=".pdf"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        useAppStore.getState().setFile(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;