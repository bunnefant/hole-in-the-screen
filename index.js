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
// app.get('/:room' , (req,res)=>{
//     // res.render('index' , {RoomId:req.params.room});
// });

var songDataForRoom = {

}

io.on("connection" , (socket)=>{
  console.log("Conn "+socket.id)

  var userRoom
  socket.on('newUser' , (id , room)=>{
    userRoom = room
    socket.join(room);
    if(songDataForRoom[room] != undefined){
      socket.emit("forceSongData", songDataForRoom[room][0], songDataForRoom[room][1], songDataForRoom[room][2])
    }
    socket.to(room).emit('userJoined', id);
    socket.on('disconnect' , ()=>{
        socket.to(room).emit('userDisconnect' , id);
    })
  })

  socket.on('songData', (songFileToPlay, songPosesToShow, nextHoleTimer) => {
    // received from client
    if(songDataForRoom[userRoom] == undefined){
      songDataForRoom[userRoom] = [songFileToPlay, songPosesToShow, nextHoleTimer]
      console.log("server song", songFileToPlay, songPosesToShow, nextHoleTimer)
      socket.to(userRoom).emit("forceSongData", songFileToPlay, songPosesToShow, nextHoleTimer)
    }else{
      // player trying to override, ignore

    }
  })

  socket.on("poseAndScore", (obj) => {
    socket.to(userRoom).emit("poseAndScore", obj)
  })

  socket.on("skeleton", (obj) => {
    // console.log()
    socket.to(userRoom).emit("skeleton", obj)
  })
})
app.use(express.static('public'))


app.get('/', (req, res) => {
  // res.send('Hello World!')
  res.sendFile(path.join(__dirname, '/index.html'));
})

server.listen(port, () => {
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