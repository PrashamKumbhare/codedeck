import { useEffect, useRef } from "react";

function WebPreview({ html, css, js }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const doc = iframeRef.current.contentDocument;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            ${css}
          </style>
        </head>

        <body>
          ${html}

          <script>
            try {
              ${js}
            } catch(e) {
              document.body.innerHTML += 
                "<pre style='color:red'>" + e + "</pre>";
            }
          </script>
        </body>
      </html>
    `;

    doc.open();
    doc.write(content);
    doc.close();
  }, [html, css, js]);

  return (
    <iframe
      ref={iframeRef}
      title="preview"
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        background: "white"
      }}
    />
  );
}

export default WebPreview;