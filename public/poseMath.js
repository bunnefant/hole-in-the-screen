
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

  console.log(keypoints)

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
  return normalizedKeypoints
}

// function compareTwoNormalizedPoses(keypoints1, keypoints2){
//   const BODY_PART_VALID_THRESHOLD = 0.50; 



// }

function compareTwoNormalizedPoses(keypoints1, keypoints2){
  console.log("Norm "+JSON.stringify(keypoints1))
  // frame1 = [x1, y1, c1, x2, y2, c2, ...]
  // frame2 = [x1, y1, c1, x2, y2, c2, ...]

  // return percent of body parts in right place and the body parts that are out of place
  // console.log("F1 "+frame1)
  // console.log("F2 "+frame2)

  const BODY_PART_VALID_THRESHOLD = 0.50; 

  // the most important threshold
  const BODY_PART_DISTANCE_CLOSE_THRESHOLD = 0.15; // 0.175 // the body parts have to be within 5% of each other


  var numOfBodyPartsCompared = 0;
  var numOfBodyPartsCorrect = 0;

  var wrongBodyParts = []
  for(var i = 0; i < keypoints1.length; i ++){

      var f1x = keypoints1[i].position.x
      var f1y = keypoints1[i].position.y
      var f1c = keypoints1[i].score
      var f1p = keypoints1[i].part


      var f2x = keypoints2[i].position.x
      var f2y = keypoints2[i].position.y
      var f2c = keypoints2[i].score
      var f2p = keypoints2[i].part

      if(f1c > BODY_PART_VALID_THRESHOLD && f2c > BODY_PART_VALID_THRESHOLD){
        if(f1p != f2p){
          console.error("PARTS DO NOT MATCH");
        }
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
          // we are going to assume the model detects most of the body parts so we wont worry about this
          console.log("bad body part "+f1c+" "+f2c+" "+f1p)
      }
  }
  console.log(numOfBodyPartsCorrect, numOfBodyPartsCompared)
  var percentOfCorrectBodyParts = numOfBodyPartsCorrect / numOfBodyPartsCompared
  return [percentOfCorrectBodyParts, wrongBodyParts]
}