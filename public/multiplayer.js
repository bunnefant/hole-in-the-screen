const socket = io('/');
const peer = new Peer();
let myVideoStream;
let myId;
let socketId;
var videoGrid = document.getElementById('videoDiv')
var myvideo = document.createElement('video');
myvideo.muted = true;
const peerConnections = {}

var otherHoleTrans;
var otherScore;
var otherPose;
var otherSkele;

var otherPlayerVideo;
navigator.mediaDevices.getUserMedia({
  video:true,
  audio:true
}).then((stream)=>{
  myVideoStream = stream;

  // const gameStream = document.getElementById("defaultCanvas0").captureStream(30);


  // addVideo(myvideo , stream);
  peer.on('call' , call=>{
    call.answer(stream);
    
    const vid = document.createElement('video');
    call.on('stream' , userStream=>{
      addVideo(vid , userStream);
    })
    call.on('error' , (err)=>{
      alert(err)
    })
    call.on("close", () => {
        console.log(vid);
        vid.remove();
    })
    peerConnections[call.peer] = call;
  })
}).catch(err=>{
    alert(err.message)
})

peer.on('error' , (err)=>{
  alert(err.type);
});

socket.on("connect", () => {
  socketId = socket.id;
});


socket.on('userDisconnect' , id=>{
  console.log(id)
  if(peerConnections[id]){
    peerConnections[id].close();
  }
})
function addVideo(video , stream){
  console.log("new video stream frame")

  if(otherPlayerVideo != undefined){
    return
  }
  video.srcObject = stream;
  otherPlayerVideo = video;

  createCanvas(canvasWidth, canvasHeight);

  // video.hide();


  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video);
}
peer.on('open' , (id)=>{
  myId = id;
  console.log(myId)
})


function createRoom(){

}

var that = this
var gotSongData = false;
function joinRoom(){
  var roomCode = document.getElementById("roomCodeInput").value;
  console.log("join "+roomCode)

 
  socket.on('userJoined' , (id) =>{
    console.log("new user joined ", id)
    // if(songInfo != undefined){

    //   gotSongData = true;
    // }
    const call  = peer.call(id , myVideoStream);
    const vid = document.createElement('video');
    call.on('error' , (err)=>{
      alert(err);
    })
    call.on('stream' , userStream=>{
      addVideo(vid , userStream);
    })
    call.on('close' , ()=>{
      vid.remove();
      console.log("user disconect")
    })
    peerConnections[id] = call;
  })

  socket.on('forceSongData', (songFileToPlayS, songPosesToShowS, nextHoleTimerT) => {

    that.songFileToPlay = songFileToPlayS
    songFileToPlay = songFileToPlayS

    that.songPosesToShow = songPosesToShowS
    songPosesToShow = songPosesToShowS

    that.nextHoleTimer = nextHoleTimerT
    nextHoleTimer = nextHoleTimerT

    gotSongData = true
    console.log("got song data", that.songPosesToShow, that.nextHoleTimer, songPosesToShow, songPosesToShowS)
  })
  socket.emit("newUser", socketId, roomCode);

  socket.on("poseAndScore", (obj) => {
    let id = obj.id;
    let score = obj.score;
    let transSkele = obj.transSkele;

    if(id != socketId){
      console.log("got other score", score)
      otherScore = score;
      otherHoleTrans = transSkele;
    }
  })

  socket.on("skeleton", (obj) => {
    let id = obj.id;

    if(id != socketId){
      console.log("got other skele")
      otherPose = obj.pose
      otherSkele = obj.skele
    }
  })

  startLocalSingleplayer();
  moveCanvasToChild();

  updateSinglePlayerHoleCallbacks.push(poseUpdated)
  updateSinglePlayerPoseCallbacks.push(skeletonUpdated)

  flippedDrawCallbacks.push(multiFlippedDraw)
  drawCallbacks.push(multiDrawCallback)

  console.log('sending song data ', songPosesToShow)
  socket.emit('songData', songFileToPlay, songPosesToShow, nextHoleTimer)
}

function multiFlippedDraw(){

}

function multiDrawCallback(){

}

// every 3 seconds, hole changes
function poseUpdated(score, leftTrans){
  socket.emit("poseAndScore", {
    id:socketId, 
    score:score, 
    transSkele: leftTrans
  })
}

function skeletonUpdated(skeleton, pose){
  if(skeleton == undefined){
    return
  }
  socket.emit("skeleton", {
    id:socketId,
    skele: skeleton  
  })
}