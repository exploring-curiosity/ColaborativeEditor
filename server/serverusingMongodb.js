var mongoClient = require("mongodb");
var url = "mongodb://localhost:27017/colab-edit";


const io = require('socket.io')(3001,{
    cors:{
        origin: 'http://localhost:3000/',
        methods: ['GET','POST']
    }
})

const defaultValue = ""

io.on("connection",socket =>{
    socket.on('get-document',async documentId => {
        const document= await findOrCreateDocument(documentId);
        socket.join(documentId)
        socket.emit('load-document',document.data);
        socket.on('send-change',delta =>{
            socket.broadcast.to(documentId).emit("receive-changes", delta);
        })
        socket.on("save-document",async data=>{
            await MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                var dbo = db.db("colab-edit");
                var myquery = { _id: new mongoClient.ObjectID(id)};
                var newvalues = { $set: {data: data} };
                dbo.collection("customers").updateOne(myquery, newvalues, function(err, res) {
                    if (err) throw err;
                    db.close();
                });
            });
        })
    })
})

async function findOrCreateDocument(id){
    if(id==null) return
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("colab-edit");
        dbo.collection("Document").findOne({"_id":new mongoClient.ObjectID(id)},{$exists:true}).toArray(function(err, result) {
            if (err) throw err;
            if(!res)
            {
                var myobj = { _id:new mongoClient.ObjectID(id),data:defaultValue};
                dbo.collection("Document").insertOne(myobj, function(err, res) {
                    if (err) throw err;
                    db.close();
                    return myobj;
                });
            }
            db.close();
            return result;
        });
    });
}