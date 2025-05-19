import { BrowserRouter } from "react-router-dom";
import { pdfjs } from "react-pdf";
import Header from "./components/Header";
import PdfViewer from "./components/PdfViewer";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function App() {

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex" style={{ height: "calc(100vh - 64px)" }}>
          <PdfViewer />
        </main>
      </div>
    </BrowserRouter>
  );
}
