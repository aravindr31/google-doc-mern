import React, { useCallback, useEffect, useState } from "react";
import "quill/dist/quill.snow.css";
import Quill from "quill";
import { io } from "socket.io-client";
import { useParams } from "react-router";

let toolbarOptions = [
  ["bold", "italic", "underline", "strike"], // toggled buttons
  ["blockquote", "code-block"],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: "ordered" }, { list: "bullet" }],
  [{ script: "sub" }, { script: "super" }], // superscript/subscript
  [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
  [{ direction: "rtl" }], // text direction

  [{ size: ["small", false, "large", "huge"] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ["clean"], // remove formatting button
];
function Editor() {
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();
  const { id } = useParams();
  let docId = id;

  useEffect(() => {
    const connection = io("http://localhost:5000");
    setSocket(connection);

    return () => {
      connection.disconnect();
    };
  }, []);

  useEffect(() => {
    if (quill == null || socket == null) return;

    socket.once("loadDocs", (doc) => {
      console.log(doc);
      quill.setContents(doc);
      quill.enable();
    });
    socket.emit("getDocs", docId);
  }, [socket, quill, docId]);

  useEffect(() => {
    if (quill == null || socket == null) return;
    const save_interval = setInterval(() => {
      socket.emit("saveDocs", quill.getContents());
    }, 1000);

    return () => {
      clearInterval(save_interval);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (quill == null || socket == null) return;
    const quillHandler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send delta", delta);
    };
    quill.on("text-change", quillHandler);
    return () => {
      quill.off("text-change", quillHandler);
    };
  }, [quill, socket]);

  useEffect(() => {
    if (quill == null || socket == null) return;
    const quillHandler = (delta) => {
      quill.updateContents(delta);
    };
    socket.on("receive delta", quillHandler);
    return () => {
      socket.off("receive delta", quillHandler);
    };
  }, [quill, socket]);

  const container_wrapper = useCallback((wrapper) => {
    if (wrapper == null) return;
    wrapper.innerHTML = "";
    const Editor = document.createElement("div");
    wrapper.append(Editor);
    const genQuill = new Quill(Editor, {
      modules: {
        toolbar: toolbarOptions,
      },
      theme: "snow",
    });
    genQuill.enable(false);
    genQuill.setText("Loading.. Please Wait");
    setQuill(genQuill);
  }, []);
  return <div className="container" ref={container_wrapper}></div>;
}

export default Editor;
