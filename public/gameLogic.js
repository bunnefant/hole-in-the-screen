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

var audioPlayer;

// single player only left pose is used
var pose1;
var pose2;
var leftPose;
var rightPose;

var leftTrans;
var rightTrans;

var scoreLeft = 0;
var scoreRight = 0;

var bGenerateNewHole = false;

var leftColR = 255
var leftColG = 0
var leftColB = 0

var rightColR = 0
var rightColG = 0
var rightColB = 255

var endVideo;

function startLocalMultiplayer(){
  var startingDiv = document.getElementById("startingOption");
  startingDiv.style.display = "none";

  var gameDiv = document.getElementById("game");
  gameDiv.style.display = "";
  gameCanvas = document.getElementById("defaultCanvas0");
  isMultiplayer = true;
  
  poseUpdatedCallbacks.push(updatedPoseMultiplayer)
  flippedDrawCallbacks.push(drawInverted)
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
  flippedDrawCallbacks.push(drawInverted)
  drawCallbacks.push(drawGame)

  getSongData()
}

function updatedPoseSingleplayer(poses){
  if(poses.length == 0){
    pose1 = null;
    pose2 = null;
    leftPose = null;
    rightPose = null;
    return;
  }
  pose1 = poses[0]

  leftPose = pose1.pose;
  // console.log("udpated singleplayer "+JSON.stringify(leftPose))

  var holeData = songPosesToShow[currentHoleIndex]
  if(holeData != null && bGenerateNewHole){
    var holePoseName = holeData.pose;
    // var holeNorm = normalizePose(allPoses[holePoseName].pose.keypoints)
    var holePose = allPoses[holePoseName]
      
    // TODO use width, height
    var cX = getRandomInt(width*0.5)+width*0.25
    var cY = getRandomInt(height*0.5)+height*0.25

    console.log("rand center", cX, cY, canvasWidth, canvasHeight, gameCanvas.width, gameCanvas.height)
    var changes = transformPoseToCenter(holePose.pose, cX, cY, 1)
    var newLeftPose = createBodyObjectTransformed(holePose.pose, changes[1], changes[2])
    leftTrans = calcSkeletonTranslation(newLeftPose, holePose.pose, holePose.skeleton)

    bGenerateNewHole = false;
  }else if(holeData == null){
    leftTrans = null;
  }
  
  

  var poseValid = leftPose.score > POSE_ACCEPTANCE_THRESHOLD;
  if(!poseValid){
    return
  }
  var player1Ready = checkHandsAboveHead(leftPose)
  
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
  pose1 = null;
  pose2 = null;
  rightPose = null;
  leftPose = null;

  if(isMultiplayer && poses.length < 2){
    
    return;
  }

  // guaranteed two poses

  var testPose1 = poses[0]
  var testPose2 = poses[1]

  // console.log(testPose1, testPose2)

  var p1X = xAverageofPoints(testPose1.pose)
  var p2X = xAverageofPoints(testPose2.pose)

  pose1 = p1X < p2X ? testPose1 : testPose2;
  pose2 = p1X >= p2X ? testPose1 : testPose2;

  leftPose = pose1.pose;
  rightPose = pose2.pose;

  var bothPosesValid = leftPose.score > POSE_ACCEPTANCE_THRESHOLD && rightPose.score > POSE_ACCEPTANCE_THRESHOLD;
  // console.log("s1 "+leftPose.score +" s2 "+rightPose.score)
  if(!bothPosesValid){
    return
  }
  let holeData = songPosesToShow[currentHoleIndex]
  if(holeData != null && bGenerateNewHole){
    var holePoseName = holeData.pose;
    // var holeNorm = normalizePose(allPoses[holePoseName].pose.keypoints)
    const holePose = allPoses[holePoseName]

    var cXL = getRandomInt(canvasWidth2*0.3)+canvasWidth2*0.8
    if(cXL < canvasWidth*0.3){
      cXL = canvasWidth*0.3
    }
    var cYL = getRandomInt(canvasHeight2*0.6)+canvasHeight2*0.2

    var cXR = getRandomInt(canvasWidth2*0.7)+canvasWidth2*0.2+cXL;//canvasWidth2*0.4
    var cYR = getRandomInt(canvasHeight2*0.6)+canvasHeight2*0.2

    var changesL = transformPoseToCenter(holePose.pose, cXL, cYL, 1)
    var newLeftPose = createBodyObjectTransformed(holePose.pose, changesL[1], changesL[2])
    
    var changesR = transformPoseToCenter(holePose.pose, cXR, cYR, 1)
    var newRightPose = createBodyObjectTransformed(holePose.pose, changesR[1], changesR[2])

    console.log(canvasHeight2*0.25, canvasHeight2*0.25 + canvasHeight2*0.5)
    console.log("cxl ", cXL, cXR)
    leftTrans = calcSkeletonTranslation(newLeftPose, holePose.pose, holePose.skeleton)
    rightTrans = calcSkeletonTranslation(newRightPose, holePose.pose, holePose.skeleton)
    console.log("left and right trans ")
    // now change the hole pose itself for score calculations

    bGenerateNewHole = false;
  }else if(holeData == null){
    leftTrans = null;
    rightTrans = null;
  }


  
  var player1Ready = checkHandsAboveHead(leftPose)
  var player2Ready = checkHandsAboveHead(rightPose)
  
  console.log("R1 "+player1Ready +" R2"+player2Ready)
  if(gameStarted || countdownStarted){
    return
  }
  
  if(!(player1Ready && player2Ready)){
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
  if(pose == null){
    return 0;
  }
  if(pose["nose"] != undefined && pose["nose"].x != undefined){
    return pose.nose.x
  }
  var x = 0;
  var c = 0;
  for(var i = 0; i < pose.keypoints.length; i++){
    var keypoint = pose.keypoints[i];
    if(keypoint.score >= 0.5){
      x += keypoint.position.x;
      c++;
    }
  }
  return x/c;
}

function topCenterPose(pose){
  if(pose == null){
    return 0;
  }
  var x = xAverageofPoints(pose);
  // want lowest bc top of screen is 0
  // try for radius - nose.y, otherwise just highest
	
  if(pose["rightEar"] != undefined && pose["rightEar"].x != undefined){
    if(pose["leftEar"] != undefined && pose["leftEar"].x != undefined){
      var dia = Math.max(pose["rightEar"].x, pose["leftEar"].x) - Math.min(pose["rightEar"].x, pose["leftEar"].x)
      if(pose["nose"] != undefined && pose["nose"].x != undefined){
        return [canvasWidth - pose["nose"].x - 10, pose.nose.y - (dia*1.2)];
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
  bGenerateNewHole = true;
  // play the song
  audioPlayer = new Audio(songFileToPlay).play()


}

function takeSnapshot(){
  screenshotCanvas.style.display = "none"
  screenshotCanvas.width = 640;
  screenshotCanvas.height = 480;
  var ctx = screenshotCanvas.getContext('2d');
  // ctx.canvas.hidden = true;
  console.log(video);
  ctx.drawImage(video.elt, 0, 0, screenshotCanvas.width, screenshotCanvas.height);
  var dataURI = screenshotCanvas.toDataURL('image/jpeg'); // can also use 'image/png'
  screenshotData.push(dataURI)

  let formData = new FormData();
  formData.append("file", dataURI);
  fetch('/upload', {method: "POST", body: formData});
}


function drawInverted(){
  noFill();
  stroke(100, 100, 240);

  strokeWeight(10);
  rect(0, 0, width/2, height)
  stroke(250, 100, 0);

  rect(width/2, 0, width/2, height)

  if(pose1 != undefined){
    if(pose1.skeleton != undefined){
      // console.log("skele 1"+JSON.stringify(pose1.skeleton))
      drawPose(pose1.skeleton, 10, leftColR, leftColG, leftColB)

    }
  }
  if(pose2 != undefined){
    if(pose2.skeleton != undefined){
      // console.log("skele 2"+JSON.stringify(pose2.skeleton))

      drawPose(pose2.skeleton, 20, rightColR, rightColG, rightColB)

    }
  }

  if(gameStarted && !gameEnded){
    if(leftTrans != null){
      // console.log("draw left hole")
      drawHoleInScreen(leftTrans, leftPose, leftColR, leftColG, leftColB)
    }
    if(rightTrans != null){
      // console.log("draw right hole")
      drawHoleInScreen(rightTrans, rightPose, rightColR, rightColG, rightColB)
    }
  }
}


function drawGame(){
  // every frame
  var now = Date.now();
  var dt = deltaTime;//((now - lastUpdate) ) / 1000;


  // drawSkeleton();
  // console.log(leftPose)
  

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
    // if(leftTrans != null){
    //   // console.log("draw left hole")
    //   drawHoleInScreen(leftTrans, leftPose)
    // }
    // if(rightTrans != null){
    //   // console.log("draw right hole")
    //   drawHoleInScreen(rightTrans, rightPose)
    // }


    drawScoreText(leftPose, scoreLeft, leftColR, leftColG, leftColB)
    if(isMultiplayer){
      drawScoreText(rightPose, scoreRight, rightColR, rightColG, rightColB)
    }
    if(nextHoleTimer > 0){
      // calculate scale and position based on time left to hole snapshot
      // visual only
      
			fill(0, 0, 0);
			text(Math.round(nextHoleTimer/1000), 310, 10, 100, 80);

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
      var hm = normalizePose(allPoses[holePoseName].pose.keypoints)
      var holeNorm = hm[0];
      var holeCenterX = hm[1];
      var holeCenterY = hm[2];

      // console.log(allPoses, songPosesToShow, currentHoleIndex)
      console.log(holeNorm, holePoseName, allPoses)

      var rightNorm;
      var comparisonRight;

      var leftNorm;
      var comparisonLeft;
      if(leftPose != null){
        var ln = normalizePose(leftPose.keypoints)
        leftNorm = ln[0]
        var leftNormX = ln[1];
        var leftNormY = ln[2];

        comparisonLeft = compareTwoNormalizedPoses(leftNorm, holeNorm, leftNormX, leftNormY, holeCenterX, holeCenterY)
      }
      if(isMultiplayer && rightPose != null){
        var rn = normalizePose(rightPose.keypoints)
        rightNorm = rn[0]
        var rightNormX = rn[1];
        var rightNormY = rn[2];

        comparisonRight = compareTwoNormalizedPoses(rightNorm, holeNorm, rightNormX, rightNormY, holeCenterX, holeCenterY)
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
      }else{
        bGenerateNewHole = true;
      }
    }
  }

  if(gameEnded){

  }
}

// function generateNewHole(){

// }

function scoreFromAccuracy(acc){
  return Math.round(acc * 1000) / 10
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

function drawScoreText(pose, score, r, g, b){
  var textPos = topCenterPose(pose)
  // console.log("drawing score text "+score+" "+JSON.stringify(textPos))
  textSize(32);
  fill(r, g, b)
  text(score+"", textPos[0], textPos[1], 70, 80);
}

function endGame(){
  gameEnded = true;
  // hide game
  var gameDiv = document.getElementById("game");
  gameDiv.style.display = "none";
  // gameCanvas = document.getElementById("defaultCanvas0");
  
  var postGame = document.getElementById("postGame");
	/*
  for(var i = 0; i < screenshotData.length; i++){
    var imgURI = screenshotData[i];
    var img = document.createElement('img')
    img.src = imgURI;
    postGame.appendChild(img);
  }
	*/
  var leftScoreEle = document.getElementById("scoreL");
  leftScoreEle.innerHTML = "Red: "+scoreLeft

  var rightScoreEle = document.getElementById("scoreR");
  rightScoreEle.innerHTML = "Blue: "+scoreRight

  postGame.style.display = "";

  var gallery = document.getElementById("gallery");
  var spinner = document.getElementById("spinner");
  for(var i = 0; i < screenshotData.length; i++){
    var imgURI = screenshotData[i];
    var img = document.createElement('img')
    img.src = imgURI;
    spinner.appendChild(img);
  }
	gallery.style.display = "";
  
}

function resetToStarting(){
  gameEnded = false;
  isMultiplayer = false;
  countdownStarted = false;
  gameStarted = false;
  showCountdown = false;
  currentHoleIndex = 0;

  flippedDrawCallbacks = []
  drawCallbacks = []
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

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// const queryString = window.location.search;
// const urlParams = new URLSearchParams(queryString);
// const gameMode = urlParams.get('g')
// if(gameMode == "1"){
//   startLocalSingleplayer()
// }else if(gameMode == "2"){
//   startLocalMultiplayer()
// }
