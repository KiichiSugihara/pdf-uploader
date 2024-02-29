// 必要なライブラリをインポートしますの
import React, { useState, useEffect } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Button from "@material-ui/core/Button";

// PDF.jsをインポートしますの
import { pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const App: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [pdfUrls, setPdfUrls] = useState<string[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files: File[] = Array.from(event.target.files);
      // Blob URLを生成しますの
      const newPdfUrls = files.map((file) => URL.createObjectURL(file));
      setPdfUrls(newPdfUrls);
      generateThumbnails(files);
      setOpen(true); // Dialogを開きますの
    }
  };

  useEffect(() => {
    // コンポーネントがアンマウントされるときにBlob URLを解放しますの
    return () => {
      pdfUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [pdfUrls]);

  const generateThumbnails = async (files: File[]) => {
    const newThumbnails: string[] = [];
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const pdfData = e.target?.result;
        const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
        const firstPage = await pdf.getPage(1);
        const viewport = firstPage.getViewport({ scale: 1 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        await firstPage.render(renderContext).promise;
        newThumbnails.push(canvas.toDataURL());
        if (newThumbnails.length === files.length) {
          setThumbnails(newThumbnails);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="application/pdf"
        multiple
        onChange={handleFileSelect}
      />
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogContent>
          {thumbnails.map((thumbnail, index) => (
            <a
              key={index}
              href={pdfUrls[index]} // ここでBlob URLをリンクとして使用しますの
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={thumbnail}
                alt={`PDF thumbnail ${index + 1}`}
                style={{ width: "100px", height: "auto" }}
              />
            </a>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>閉じる</Button>
          {/* 送信ボタン等の処理は、ここに追加しますの */}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default App;
