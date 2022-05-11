### Conversion of documents to images with  Nextjs


## Introduction
Document processors like Microsoft Office are the de facto standard for producing and formatting documents. When transmitting information such as statements or invoices, even its most passionate customers seek extra features and usefulness from online file converters to make PDFs. The reason for this is that word documents can be edited, whereas PDF documents cannot. The same may be said about how PDF documents maintain their formatting across numerous devices. In this article, you will be able to create a feature that distinguishes pdf pages as images and provide online storage for any page a user requires i.e for future reference.

Lets' begin writing

## Codesandbox

Check the sandbox demo on  [Codesandbox](/).

<CodeSandbox
title="mergevideos"
id=" "
/>

You can also get the project github repo using [Github](/).

## Prerequisites

Entry-level javascript and React/Nextjs knowledge.

## Setting Up the Sample Project

Create your new Nextjs app using `npx create-next-app pdfconvert` in your terminal.
Head to your project root directory `cd pdfconvert`
 

In our Nextjs framework backend, we will have to integrate [Cloudinary](https://cloudinary.com/?ap=em), which will be used to store our uploaded processed images. 

Create your Cloudinary account using [Link](https://cloudinary.com/console) and log into it to access your dashboard which contains your environment variable keys necessary for the integration in your project.

In your project directory, include Cloudinary in your dependencies `npm install cloudinary`

Use the guide below to fill in your environment variables in the `.env.local` file from Cloudinary dashboard.

```
CLOUDINARY_CLOUD_NAME =

CLOUDINARY_API_KEY =

CLOUDINARY_API_SECRET =
```

Restart your project using `npm run dev`.

In the `pages/api` folder, create a new file named `upload.js`. 
Start by configuring the environment keys and libraries.

```
var cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

Create a handler function to execute the POST request. The function will receive media file data and post it to the cloudinary website. It then captures the media file's cloudinary link and send it back as a response.

```
export default async function handler(req, res) {
    if (req.method === "POST") {
        let url = ""
        try {
            let fileStr = req.body.data;
            const uploadedResponse = await cloudinary.uploader.upload_large(
                fileStr,
                {
                    resource_type: "video",
                    chunk_size: 6000000,
                }
            );
            url = uploadedResponse.url
        } catch (error) {
            res.status(500).json({ error: "Something wrong" });
        }

        res.status(200).json({data: url});
    }
}
```

 

The code above concludes our backend.

Before you begin front end, include the following in your environment variables:
`npm install pdfjs-dist`

Create a directory, `components/Converter.client.js` and include it in your `pages/index` directory.

```
"pages/index"

import Converter from "../components/Converter.client";

export default function Home() {
  return (
    <Converter />
  );
}
```
In the `components/Converter.client.js` directory, start with including the necessary imports
```
"components/Converter.client.js"


import React, { useState, useRef, useEffect } from "react";

import * as pdfjsLib from "pdfjs-dist/build/pdf";
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const HTTP_SUCCESS = 200;
```

The `HTTP_SUCCESS` variablewill be used to determine successfull responses from api calls.

Create a function named `Coverter` and declare the following statehooks:

```
"components/Converter.client.js"

export default function Converter() {
    const [img, setImg] = useState();
    const [name, setName] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [pages, setPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pdfFile, setPdfFile] = useState(null);
    const pageRenderRef = useRef();

    return (
        <>
        works
        </>
    )
}
```

`useState`  is a hook that lets you add React state to function components and `useRef` hook allows you to persist values between renders.
We will also add a `useEffect` hook to perform side effects in our functional component.

```
useEffect(() => {
    if (pdfFile && currentPage) {
      pageRender();
    }
  }, [pdfFile, currentPage]);
```
The above hook will look out for the `pdfFile` and `currentPage` and render the page whenever changes are made in the two variables.

Create a function `onConvert` :

```
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
```
The function above starts by creating a URL string object from the file object `selectedFile`, assigning it to the constant `uri`. The constant pdf will use `pdfjsLib` to capture the uri string and categorize it based on the files selected and number of pages the file contains using react `useState` hooks.

Create a `pageRender` function to capture the user's selected page to a canvas and assign it to the `setImg` hook as a string object

```
const pageRender = () => {
    pdfFile.getPage(currentPage).then((page) => {
      {
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
        page.render(renderContext);
        setImg(canvas.toDataURL());
        console.log(pageRenderRef.current);
      }
    });
};
```

Once the image is captured, we will have to upload it to the backend for cloudinary upload. Note the `HTTP_SUCCESS` variable created earlier.

```
  const uploadVideo = async () => {
    console.log(img);
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
```

Finally, include the following in your return statement to create your UI. The css files can be located in the Github repository

```
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
```
The UI should look like below

![|UI](https://res.cloudinary.com/dogjmmett/image/upload/v1652239380/UI_u3vkrp.png "UI")

Thats it! Ensure to go through the article to enjoy the experience.