
function euclidDist(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2)**2 + (y1 - y2)**2);
}

function normalizePose(keypoints){
  /* 
  keypoints: {
    [
      {
        score:0,
        position:{
          x:0,
          y:0
        }
      }
    ]
  }

  */

  // console.log(keypoints)

  var xValsArray = []
  var yValsArray = []
  for (var i = 0; i < keypoints.length; i++) {
      xValsArray.push(keypoints[i].position.x);
      yValsArray.push(keypoints[i].position.y);
  }

  var minYVal = Math.min(...yValsArray);
  var minXVal = Math.min(...xValsArray);

  var maxYVal = Math.max(...yValsArray);
  var maxXVal = Math.max(...xValsArray);

  var x_width = maxXVal - minXVal;
  var y_width = maxYVal - minYVal;

  var centerX = minXVal + x_width/2;
  var centerY = minYVal + y_width/2;

  var normalizedKeypoints = []
  for(var i = 0; i < keypoints.length; i++){
    var keypoint = keypoints[i];
    var keypointX = keypoint.position.x;
    var keypointY = keypoint.position.y;

    normalizedKeypoints.push({
      score: keypoint.score,
      part: keypoint.part,
      position: {
        x: (keypointX - minXVal) / x_width,
        y: (keypointY - minYVal) / y_width,
      }
    })
  }
  // console.log("norm "+JSON.stringify(normalizedKeypoints))
  return [normalizedKeypoints, centerX, centerY]
}

function compareTwoNormalizedPoses(player, hole, leftNormX, leftNormY, holeCenterX, holeCenterY){
  // console.log("Norm "+JSON.stringify(keypoints1))
  // frame1 = [x1, y1, c1, x2, y2, c2, ...]
  // frame2 = [x1, y1, c1, x2, y2, c2, ...]

  // return percent of body parts in right place and the body parts that are out of place
  // console.log("F1 "+frame1)
  // console.log("F2 "+frame2)

  var dist = euclidDist(leftNormX, leftNormY, holeCenterX, holeCenterY);
  console.log("D "+dist)
  if(dist > 300){
    // return [0, 0]
  }

  const BODY_PART_VALID_THRESHOLD = 0.50; 

  // the most important threshold
  const BODY_PART_DISTANCE_CLOSE_THRESHOLD = 0.15; // 0.175 // the body parts have to be within 5% of each other


  var numOfBodyPartsCompared = 0;
  var numOfBodyPartsCorrect = 0;

  var wrongBodyParts = []
  for(var i = 0; i < player.length; i ++){

      var f1x = player[i].position.x
      var f1y = player[i].position.y
      var f1c = player[i].score
      var f1p = player[i].part


      var f2x = hole[i].position.x
      var f2y = hole[i].position.y
      var f2c = hole[i].score
      var f2p = hole[i].part

      if(f1p != f2p){
        console.error("PARTS DO NOT MATCH");
        // TODO anything else?
      }

      if(f2p == "nose" || f2p == "leftEye" || f2p == "rightEye" || f2p == "leftEar" || f2p == "rightEar"){
        continue;
      }

      if(f1c > BODY_PART_VALID_THRESHOLD/* && f2c > BODY_PART_VALID_THRESHOLD*/){
        
          numOfBodyPartsCompared += 1;

          // test if the two body parts are close
          var xCompare = Math.abs(f1x - f2x)
          var yCompare = Math.abs(f1y - f2y)
          
          if(xCompare < BODY_PART_DISTANCE_CLOSE_THRESHOLD && yCompare < BODY_PART_DISTANCE_CLOSE_THRESHOLD){
              numOfBodyPartsCorrect += 1;
          }else{
              // this body part is not close enough
              wrongBodyParts.push(f1p)
          }
      }else{

          // console.log("bad body part "+f1c+" "+f2c+" "+f1p)
          // assume this part doesnt exist on the player, but does exist on the hole, so count it wrong
          numOfBodyPartsCompared += 1;
          wrongBodyParts.push(f2p)

      }
  }
  console.log(numOfBodyPartsCorrect, numOfBodyPartsCompared)
  var percentOfCorrectBodyParts = numOfBodyPartsCorrect / numOfBodyPartsCompared
  return [percentOfCorrectBodyParts, wrongBodyParts]
}

function transformPoseToCenter(pose, newCenterX, newCenterY, scale){
  var kp = pose.keypoints;
  var xValsArray = []
  var yValsArray = []
  for (var i = 0; i < kp.length; i++) {
      xValsArray.push(kp[i].position.x);
      yValsArray.push(kp[i].position.y);
  }

  var minYVal = Math.min(...yValsArray);
  var minXVal = Math.min(...xValsArray);

  var maxYVal = Math.max(...yValsArray);
  var maxXVal = Math.max(...xValsArray);

  var x_width = maxXVal - minXVal;
  var y_width = maxYVal - minYVal;

  var centerX = minXVal + x_width/2;
  var centerY = minYVal + y_width/2;

  // translate all by diff
  var dx = newCenterX - centerX;
  var dy = newCenterY - centerY;

  for(var i = 0; i < kp.length; i++){
    kp[i].position.x += dx;
    kp[i].position.y += dy;
  }
  console.log("dxdy", dx, dy)
  return [kp, dx, dy];
}

function createBodyObjectTransformed(pose, dx, dy){
  return {
    leftHip: {
      x: pose.leftHip.x + dx,
      y: pose.leftHip.y + dy,
    },
    rightHip: {
      x: pose.rightHip.x + dx,
      y: pose.rightHip.y + dy,
    },
    leftShoulder: {
      x: pose.leftShoulder.x + dx,
      y: pose.leftShoulder.y + dy,
    },
    rightShoulder: {
      x: pose.rightShoulder.x + dx,
      y: pose.rightShoulder.y + dy,
    },
  }
}