const db = require("./connection");
const io = require("socket.io")(5000, {
  cors: {
    orgin: "http://localhost:3000",
    method: ["GET", "POST"],
  },
});

db.connect((err) => {
  if (err) console.log("Connection error" + err);
  else console.log("Database connected successfully");
});

io.on("connection", (socket) => {
  socket.on("getDocs", async (docId) => {
    const document = await findorcreate(docId);
    socket.join(docId);
    socket.emit("loadDocs", document.data);
    socket.on("send delta", (delta) => {
      socket.broadcast.to(docId).emit("receive delta", delta);
    });
    socket.on("saveDocs", async (modified_data) => {
      await db
        .get()
        .collection("documents")
        .findOneAndUpdate(
          { _id: docId },
          { $set: { data: modified_data } },
          { returnNewDocument: true }
        );
    });
  });
  console.log("connected to server");
});

const findorcreate = async (id) => {
  if (id == null) return;
  const doc = await db.get().collection("documents").findOne({ _id: id });
  if (doc) {
    return doc;
  } else {
    return await db
      .get()
      .collection("documents")
      .insertOne({ _id: id, data: "" });
  }
};
