var gameCanvas;

var isMultiplayer = false;
var gameStarted = false;

var lastUpdate = Date.now();

var showCountdown = false;
var countdownTimer = 3000; // in ms

const POSE_ACCEPTANCE_THRESHOLD = 0.3

function startLocalMultiplayer(){
  var gameDiv = document.getElementById("game");
  gameDiv.style.display = "";
  gameCanvas = document.getElementById("defaultCanvas0");
  isMultiplayer = true;
  
  poseUpdatedCallbacks.push(updatedPoseMultiplayer)
  drawCallbacks.push(drawGame)
}

function startLocalSingleplayer(){
  var gameDiv = document.getElementById("game");
  gameDiv.style.display = "";
  gameCanvas = document.getElementById("defaultCanvas0");
  isMultiplayer = false;
  
  poseUpdatedCallbacks.push(updatedPoseSingleplayer)
  drawCallbacks.push(drawGame)
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

  if(gameStarted){
    return
  }
  
  console.log("Starting game");
  // begin the game
  // setTimeout(beginGame, 3000)
  showCountdown = true;
  countdownTimer = 3000;
  gameStarted = true;
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
  
  if(gameStarted){
    return
  }
  
  // begin the game
  // setTimeout(beginGame, 3000)
  showCountdown = true;
  countdownTimer = 3000;
  gameStarted = true;
}

function beginGame(){
  console.log("GAME ACTUALLY STARTING")
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
    beginGame();
    showCountdown = false;
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