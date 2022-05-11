import React, { useState, useRef, useEffect } from "react";

import * as pdfjsLib from "pdfjs-dist/build/pdf";
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const HTTP_SUCCESS = 200;

export default function Converter() {
  const [img, setImg] = useState();
  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [pages, setPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfFile, setPdfFile] = useState(null);
  const pageRenderRef = useRef();

  useEffect(() => {
    if (pdfFile && currentPage) {
      pageRender();
    }
  }, [pdfFile, currentPage]);

  const onConvert = async () => {
    const uri = URL.createObjectURL(selectedFile);

    const pdf = await pdfjsLib.getDocument({ url: uri });

    await pdf.promise.then(
      (_pdf) => {
        const {
          _pdfInfo: { numPages },
        } = _pdf;
        setPages(numPages);
        setPdfFile(_pdf);
      },
      (error) => {
        console.log("PDF error :", error);
      }
    );
  };

  const pageRender = () => {
    pdfFile.getPage(currentPage).then(async (page) => {
      const viewport = page.getViewport({ scale: 1 });
      const canvas = pageRenderRef.current;
      const context = pageRenderRef.current.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        enableWebGL: false,
      };
      let renderTask = page.render(renderContext);
      await renderTask.promise.then((complete) => {
        console.log(complete);
        setImg(canvas.toDataURL());
      });
    });
  };

  const uploadVideo = () => {
    
    try {
      fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({ data: img }),
        headers: { "Content-Type": "application/json" },
      }).then((response) => {
        console.log("Backend http status code : ", response.status);
        if (response.status === HTTP_SUCCESS) {
          response.json().then((result) => {
            console.log(result);
          });
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container">
      <h1>Conversion of Documents to Images with Nextjs</h1>
      <div className="row">
        <div className="column">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
          {selectedFile ? <h3>You have selected: {selectedFile.name}</h3> : ""}
          {selectedFile && <button onClick={onConvert}>Convert</button>}
        </div>
        <div className="column">
          {pdfFile && (
            <>
              <input
                type="number"
                placeholder="Page number"
                value={currentPage}
                onChange={(e) => setCurrentPage(parseInt(e.target.value))}
                min="1"
                max={pages}
              />{' '}
              <button onClick={uploadVideo}>Upload Image</button><br /><br />
              <canvas ref={pageRenderRef} width="100" height="200"></canvas>
            </>
          )}


        </div>
      </div>
    </div>
  );
}
