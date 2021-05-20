const mongoose = require("mongoose")
const Document = require("./Document")

mongoose.connect("mongodb://localhost/google-docs-clone", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
})

const io = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

const defaultValue = ""

io.on("connection", socket => {
    socket.on("get-document", async documentId => {

        try{
            const document = await findOrCreateDocument(documentId)
            console.log(document._id,document.data);
            socket.join(documentId)
            socket.emit("load-document", document.data)
        }
        catch(e){
        console.log("caught error1");
        }
        socket.on("send-changes", delta => {
        socket.broadcast.to(documentId).emit("receive-changes", delta)
        })

        socket.on("save-document", async data => {
            try{
                await Document.findByIdAndUpdate(documentId, { data })
            }
            catch(e){
                console.log("caught error 2");
            }
        })
    })
})

async function findOrCreateDocument(id) {   
    if (id == null) return
    try{
        const document = await Document.findById(id)
    }
    catch(e){
        console.log("caught error 3");
        }
    if (document) return document
    try{
    const obj =  await Document.create({ _id: id, data: defaultValue });
    console.log(obj);
    return obj;
    }
    catch(e){
    console.log("caught error 4");
    }
}