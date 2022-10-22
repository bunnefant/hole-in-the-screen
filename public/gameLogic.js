var gameCanvas;

var isMultiplayer = false;
var countdownStarted = false;
var gameStarted = false;
var gameEnded = false;

var lastUpdate = Date.now();

var showCountdown = false;
var countdownTimer = 3000; // in ms

var nextHoleTimer = 1000;
var currentHoleIndex = 0;

const POSE_ACCEPTANCE_THRESHOLD = 0.3

var songFileToPlay = ""
var songPosesToShow = []

var screenshotCanvas = document.createElement('canvas');
var screenshotData = []

function startLocalMultiplayer(){
  var startingDiv = document.getElementById("startingOption");
  startingDiv.style.display = "none";

  var gameDiv = document.getElementById("game");
  gameDiv.style.display = "";
  gameCanvas = document.getElementById("defaultCanvas0");
  isMultiplayer = true;
  
  poseUpdatedCallbacks.push(updatedPoseMultiplayer)
  drawCallbacks.push(drawGame)

  getSongData()
}

function startLocalSingleplayer(){
  var startingDiv = document.getElementById("startingOption");
  startingDiv.style.display = "none";

  var gameDiv = document.getElementById("game");
  gameDiv.style.display = "";
  gameCanvas = document.getElementById("defaultCanvas0");
  isMultiplayer = false;
  
  poseUpdatedCallbacks.push(updatedPoseSingleplayer)
  drawCallbacks.push(drawGame)

  getSongData()
}

function updatedPoseSingleplayer(poses){
  // console.log(poses)
  var pose1 = poses[0].pose
  // console.log("udpated singleplayer "+pose1.score)

  var poseValid = pose1.score > POSE_ACCEPTANCE_THRESHOLD;
  if(!poseValid){
    return
  }
  var player1Ready = checkHandsAboveHead(pose1)
  
  if(!player1Ready){
    return
  }

  if(gameStarted || countdownStarted){
    return
  }
  
  console.log("Starting game");
  // begin the game
  // setTimeout(beginGame, 3000)
  showCountdown = true;
  countdownTimer = 3000;
  countdownStarted = true;
}

function getSongData(){
  var songData = getSongDataForGame();

  songFileToPlay = songData[0]
  songPosesToShow = songData[1]
  nextHoleTimer = songData[2] // first pose start time
}

function updatedPoseMultiplayer(poses){
  // console.log(poses)

  if(isMultiplayer && poses.length < 2){
    return;
  }

  // guaranteed two poses

  var pose1 = poses[0].pose
  var pose2 = poses[1].pose

  var bothPosesValid = pose1.score > POSE_ACCEPTANCE_THRESHOLD && pose2.score > POSE_ACCEPTANCE_THRESHOLD;
  if(!bothPosesValid){
    return
  }
  var player1Ready = checkHandsAboveHead(pose1)
  var player2Ready = checkHandsAboveHead(pose2)
  
  if(!(player1Ready && player2Ready)){
    return
  }
  
  if(gameStarted || countdownStarted){
    return
  }
  
  // begin the game
  // setTimeout(beginGame, 3000)
  showCountdown = true;
  countdownTimer = 3000;
  countdownStarted = true;
}

function beginGame(){
  console.log("GAME ACTUALLY STARTING song: "+songFileToPlay)
  // expectation: song file and poses are loaded by this point

  // play the song
  new Audio(songFileToPlay).play()


}

function takeSnapshot(){
  screenshotCanvas.width = 640;
  screenshotCanvas.height = 480;
  var ctx = canvas.getContext('2d');
  console.log(video);
  ctx.drawImage(video.elt, 0, 0, screenshotCanvas.width, screenshotCanvas.height);
  var dataURI = canvas.toDataURL('image/jpeg'); // can also use 'image/png'
  screenshotData.push(dataURI)
}

function drawGame(){
  // every frame
  var now = Date.now();
  var dt = deltaTime;//((now - lastUpdate) ) / 1000;

  if(showCountdown && countdownTimer > 0){
    // console.log(countdownTimer, dt)
    fill(50);
    text("C "+countdownTimer, 10, 10, 70, 80);
    countdownTimer -= dt;
  }
  if(showCountdown && countdownTimer <= 0){
    if(!gameStarted && !gameEnded){
      beginGame();
      gameStarted = true;
    }
    showCountdown = false;
    countdownStarted = false;
  }

  if(gameStarted && !gameEnded){
    if(nextHoleTimer > 0){
      // calculate scale and position based on time left to hole snapshot

      // calculate score of players

      nextHoleTimer -= dt
    }
    if(nextHoleTimer <= 0){
      // take snapshot
      console.log("taking snapshot")
      takeSnapshot();

      // set timer
      nextHoleTimer = songPosesToShow[currentHoleIndex].timeToNext;
      console.log("Next hole "+nextHoleTimer)
      currentHoleIndex++;

      if(currentHoleIndex >= songPosesToShow.length){
        // no more poses
        // end game for now
        endGame();
      }
    }
  }

  if(gameEnded){

  }

}

function endGame(){
  gameEnded = true;
  // hide game
  var gameDiv = document.getElementById("game");
  gameDiv.style.display = "none";
  // gameCanvas = document.getElementById("defaultCanvas0");
  
  var postGame = document.getElementById("postGame");
  for(var i = 0; i < screenshotData.length; i++){
    var imgURI = screenshotData[i];
    var img = document.createElement('img')
    img.src = imgURI;
    postGame.appendChild(img);
  }
  postGame.style.display = "";
}

function resetToStarting(){
  gameEnded = false;
  isMultiplayer = false;
  countdownStarted = false;
  gameStarted = false;
  showCountdown = false;
  currentHoleIndex = 0;
  showStartingOptions()

}

function showStartingOptions(){
  var startingDiv = document.getElementById("startingOption");
  startingDiv.style.display = "";

  var postGame = document.getElementById("postGame");
  postGame.innerHTML = ""; // delete images
  postGame.style.display = "none";
}

var HANDS_ABOVE_HEAD_CONFIDENCE_THRESHOLD = 0.5
function checkHandsAboveHead(pose){
  // console.log(pose)
  var leftHand = pose["leftWrist"]
  var rightHand = pose["rightWrist"]
  var eyeLeft = pose["leftEye"].y

    // console.log(rightHand.y + " "+ eyeLeft + " "+rightHand.confidence)

  var leftHandValid = leftHand.y < eyeLeft && leftHand.confidence >= HANDS_ABOVE_HEAD_CONFIDENCE_THRESHOLD
  var rightHandValid = rightHand.y < eyeLeft && rightHand.confidence >= HANDS_ABOVE_HEAD_CONFIDENCE_THRESHOLD

  return rightHandValid
}