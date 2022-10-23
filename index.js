// Inside your app
// import Handsfree from 'handsfree'
// const Handsfree = require("handsfree");
const http = require("http");
const express = require('express')
const app = express()
const server = require('http').Server(app);
const io = require('socket.io')(server);
const {ExpressPeerServer} = require('peer')

const host = 'localhost';
const port = 8000;
const path = require('path');
const multer  = require('multer')
var fs = require('fs');
const peer = ExpressPeerServer(server , {
  debug:true
});


app.use('/peerjs', peer);
app.use(express.static('public'))
app.get('/:room' , (req,res)=>{
    // res.render('index' , {RoomId:req.params.room});
});
io.on("connection" , (socket)=>{
  socket.on('newUser' , (id , room)=>{
    socket.join(room);
    socket.to(room).broadcast.emit('userJoined' , id);
    socket.on('disconnect' , ()=>{
        socket.to(room).broadcast.emit('userDisconnect' , id);
    })
  })
})
app.use(express.static('public'))


app.get('/', (req, res) => {
  // res.send('Hello World!')
  res.sendFile(path.join(__dirname, '/index.html'));
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

var upload = multer({ dest: './uploads' })

app.post(
  "/upload",
  upload.single("file" /* name attribute of <file> element in your form */),
  (req, res) => {
    // console.log(req)
    const tempPath = "./d.png";
    const targetPath = path.join(__dirname, "./uploads/image.png");

    var img = req.body.file;
    var data = img.replace(/^data:image\/\w+;base64,/, "");
    var buf = Buffer.from(data, 'base64');
    fs.writeFile('./uploads/image'+Math.floor(Math.random() * 1000)+'.png', buf, function(){

    });

  }
);