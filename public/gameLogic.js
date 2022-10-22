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

// single player only left pose is used
var leftPose;
var rightPose;

var scoreLeft = 0;
var scoreRight = 0;

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
  console.log(poses)
  if(poses.length == 0){
    leftPose = null;
    return;
  }
  var pose1 = poses[0].pose

  leftPose = pose1;
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
    rightPose = null;
    leftPose = null;
    return;
  }

  // guaranteed two poses

  var testPose1 = poses[0].pose
  var testPose2 = poses[1].pose

  var p1X = xAverageofPoints(testPose1)
  var p2X = xAverageofPoints(testPose2)

  var pose1 = p1X < p2X ? testPose1 : testPose2;
  var pose2 = p1X >= p2X ? testPose2 : testPose1;

  leftPose = pose1;
  rightPose = pose2;

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

// try to get nose first, otherwise average
function xAverageofPoints(pose){
  if(pose["nose"] != undefined && pose["nose"].x != undefined){
    return pose.nose.x
  }
  var x = 0;
  for(var i = 0; i < pose.keypoints.length; i++){
    var keypoint = pose.keypoints[i];
    x += keypoint.position.x;
  }
  return x/pose.keypoints.length;
}

function topCenterPose(pose){
  var x = xAverageofPoints(pose);
  // want lowest bc top of screen is 0
  // try for radius - nose.y, otherwise just highest
  if(pose["rightEar"] != undefined && pose["rightEar"].x != undefined){
    if(pose["leftEar"] != undefined && pose["leftEar"].x != undefined){
      var dia = Math.max(pose["rightEar"].x, pose["leftEar"].x) - Math.min(pose["rightEar"].x, pose["leftEar"].x)
      if(pose["nose"] != undefined && pose["nose"].x != undefined){
        return [x, pose.nose.y - dia];
      }
    }
  }
  var y = 10000;
  for(var i = 0; i < pose.keypoints.length; i++){
    var keypoint = pose.keypoints[i];
    y = Math.min(y, keypoint.position.y);
  }
  return [x, y]
}

function beginGame(){
  console.log("GAME ACTUALLY STARTING song: "+songFileToPlay)
  // expectation: song file and poses are loaded by this point

  gameStarted = true;

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
    }
    showCountdown = false;
    countdownStarted = false;
  }

  if(gameStarted && !gameEnded){
    drawScoreText(leftPose, scoreLeft)
    if(isMultiplayer){
      drawScoreText(rightPose, scoreRight)
    }
    if(nextHoleTimer > 0){
      // calculate scale and position based on time left to hole snapshot
      // visual only

      

      nextHoleTimer -= dt
    }
    if(nextHoleTimer <= 0){
      // take snapshot
      console.log("taking snapshot")
      takeSnapshot();

      // createTempScoreText();

      // calculate score of players
      // TODO check score of total pose and discount bad poses
      

      // no null check for hole since it should always exist
      var holePoseName = songPosesToShow[currentHoleIndex].pose;
      var holeNorm = normalizePose(allPoses[holePoseName].pose.keypoints)
      // console.log(allPoses, songPosesToShow, currentHoleIndex)
      console.log(holeNorm, holePoseName, allPoses)

      var rightNorm;
      var comparisonRight;

      var leftNorm;
      var comparisonLeft;
      if(leftPose != null){
        leftNorm = normalizePose(leftPose.keypoints)
        comparisonLeft = compareTwoNormalizedPoses(leftNorm, holeNorm)
      }
      if(isMultiplayer && rightPose != null){
        rightNorm = normalizePose(rightPose.keypoints)
        comparisonRight = compareTwoNormalizedPoses(rightNorm, holeNorm)
      }


      if(comparisonLeft != undefined){
        scoreLeft += scoreFromAccuracy(comparisonLeft[0]);
      }
      if(comparisonRight != undefined){
        scoreRight += scoreFromAccuracy(comparisonRight[0]);
      }

      console.log(comparisonLeft, comparisonRight)

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

function scoreFromAccuracy(acc){
  return Math.round(acc * 10000) / 100
}

function createTempScoreText(position){
  let initialProps = {
    text:'+score',
    color: 'white',
    size: 30,
    position: { x: position.x, y: position.y }
  };
  var myText = createText(initialProps);
  myText.animate([
    { color: 'red', size: 200, duration: 3 }
  ]).catch(e => console.error(`Oops: ${e}`)).finally(() => {
    console.log("remove")
    myText.deleteText();
  }).catch(e => console.error(`Oops: ${e}`));
}

function drawScoreText(pose, score){
  var textPos = topCenterPose(pose)
  console.log("drawing score text "+score+" "+JSON.stringify(textPos))
  textSize(32);
  text(score+"", textPos[0], textPos[1], 70, 80);
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