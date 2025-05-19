import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { useAppStore } from '../store';

const PdfControls = () => {
  const {
    file,
    numPages,
    currentPage,
    setCurrentPage,
    scale,
    setScale,
  } = useAppStore();

  const [inputPage, setInputPage] = useState(currentPage.toString());

  useEffect(() => {
    setInputPage(currentPage.toString());
  }, [currentPage]);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setInputPage((currentPage - 1).toString());

      requestAnimationFrame(() => {
        const targetPage = document.querySelector(`[data-page-number="${currentPage - 1}"]`);
        if (targetPage) {
          targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  };

  const goToNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
      setInputPage((currentPage + 1).toString());

      requestAnimationFrame(() => {
        const targetPage = document.querySelector(`[data-page-number="${currentPage + 1}"]`);
        if (targetPage) {
          targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  };

  const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNumber = parseInt(inputPage);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= numPages) {
      setCurrentPage(pageNumber);

      requestAnimationFrame(() => {
        const targetPage = document.querySelector(`[data-page-number="${pageNumber}"]`);
        if (targetPage) {
          targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    } else {
      setInputPage(currentPage.toString());
    }
  };

  const zoomIn = () => {
    setScale(Math.min(scale + 0.1, 1.0));
  };

  const zoomOut = () => {
    setScale(Math.max(scale - 0.1, 0.7));
  };

  const resetZoom = () => {
    setScale(0.9);
  };

  return (
    <div className="bg-white border-b border-gray-100 py-2 md:py-5 px-3 md:px-6 flex flex-wrap items-center shadow-sm min-h-[48px] md:min-h-[64px]">
      <div className="w-full">
        {file ? (
          <div className="flex items-center justify-between flex-wrap md:flex-nowrap gap-4 md:gap-0">
            <div className="flex items-center gap-2 md:space-x-3">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage <= 1}
                className="p-1 md:p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-100"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} className="text-gray-600" />
              </button>

              <form onSubmit={handlePageSubmit} className="flex items-center gap-1 md:gap-0">
                <input
                  type="text"
                  value={inputPage}
                  onChange={handlePageChange}
                  className="w-12 md:w-14 bg-gray-50 border border-gray-200 rounded-md px-1 md:px-2 py-1 md:py-1.5 text-center text-sm focus:outline-none focus:ring-1 focus:ring-gray-200"
                  aria-label="Page number"
                />
                <span className="md:mx-2 text-sm text-gray-500">/ {numPages || 1}</span>
              </form>

              <button
                onClick={goToNextPage}
                disabled={currentPage >= numPages}
                className="p-1 md:p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-100"
                aria-label="Next page"
              >
                <ChevronRight size={16} className="text-gray-600" />
              </button>
            </div>

            <div className="flex items-center gap-2 md:gap-0 md:space-x-2">
              <button
                onClick={zoomOut}
                disabled={scale <= 0.8}
                className="p-1 md:p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-100"
                aria-label="Zoom out"
              >
                <ZoomOut size={16} className="text-gray-600" />
              </button>

              <button
                onClick={resetZoom}
                className="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm bg-gray-50 text-gray-600 border border-gray-200 rounded-md hover:bg-gray-100 min-w-[60px] md:min-w-[70px]"
              >
                {Math.round(scale * 100)}%
              </button>

              <button
                onClick={zoomIn}
                disabled={scale >= 1.0}
                className="p-1 md:p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-100"
                aria-label="Zoom in"
              >
                <ZoomIn size={16} className="text-gray-600" />
              </button>

              <button
                onClick={resetZoom}
                className="p-1 md:p-1.5 rounded-md hover:bg-gray-100 border border-gray-100"
                aria-label="Reset zoom"
              >
                <RotateCw size={16} className="text-gray-600" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between h-[34px]"></div>
        )}
      </div>
    </div>
  );
};

export default PdfControls;