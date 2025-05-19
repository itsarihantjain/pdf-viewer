import { FileUp } from "lucide-react";
import { useAppStore } from "../store";

export default function Header() {
  const { toggleSidebar, setFile } = useAppStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  return (
    <header className="border-b border-gray-100 bg-gray-50 shadow-sm">
      <div className="container mx-auto px-3 md:px-4 h-14 md:h-16 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center">
            PDF Viewer
          </h1>
        </div>

        <div className="flex items-center">
          <label className="relative cursor-pointer px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-white font-medium text-sm md:text-base">
            <span className="flex items-center">
              <span>New PDF</span>
              <FileUp size={16} className="ml-2" />
            </span>
            <input
              type="file"
              accept=".pdf"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>
    </header>
  );
}