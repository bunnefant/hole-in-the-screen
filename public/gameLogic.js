var gameCanvas;

var isMultiplayer = false;
var countdownStarted = false;
var gameStarted = false;

var lastUpdate = Date.now();

var showCountdown = false;
var countdownTimer = 3000; // in ms

const POSE_ACCEPTANCE_THRESHOLD = 0.3

var songFileToPlay = ""
var songPosesToShow = []

function startLocalMultiplayer(){
  var gameDiv = document.getElementById("game");
  gameDiv.style.display = "";
  gameCanvas = document.getElementById("defaultCanvas0");
  isMultiplayer = true;
  
  poseUpdatedCallbacks.push(updatedPoseMultiplayer)
  drawCallbacks.push(drawGame)

  getSongData()
}

function startLocalSingleplayer(){
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

function drawGame(){
  // every frame
  var now = Date.now();
  var dt = ((now - lastUpdate) ) / 1000;

  if(showCountdown && countdownTimer > 0){
    // console.log(countdownTimer, dt)
    fill(50);
    text("C "+countdownTimer, 10, 10, 70, 80);
    countdownTimer -= dt;
  }
  if(countdownTimer <= 0){
    if(!gameStarted){
      beginGame();
      gameStarted = true;
    }
    showCountdown = false;
    countdownStarted = false;
  }

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