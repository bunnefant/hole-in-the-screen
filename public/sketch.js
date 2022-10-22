// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet example using p5.js
=== */

let video;
let poseNet;
let poses = [];
let	holeScale = 100;
let holePose = [];
let playerCenter = [0, 0];
let poseHoleCenter = [0, 0];
let poseTranslation = [0,0];
let posePlayerScale = 1.0;

var allPoses = {}
var poseUpdatedCallbacks = []
var drawCallbacks = []

let testHolePose1;
let testHolePose2;

function getHoleInScreen(completion) {
	fetch('screenHoles.json')
		.then(resp => resp.json())
		.then(data => {
      allPoses = data;
			holePose = data.pose1;

      testHolePose1 = data.pose1.pose;
      // testHolePose2 = data.pose2.pose;
      completion();
		});
}

function drawHoleInScreen(translated, pose) {

  console.log(translated)
  // Loop through all the skeletons detected
	 let skeleton = translated;
	 if (skeleton.length == 0) {
	   return;
	 }
	 fill(255, 0, 0, 100);
	 //rect(0, 0, 640, 480);
	 let torso = {};
   for (let j = 0; j < skeleton.length; j++) {
     let partA = skeleton[j][0];
     let partB = skeleton[j][1];
		 //note down coordinates for torso while looping thorugh skeleton
		 if (partA.part == 'leftHip' && partB.part == 'leftShoulder') {
		   torso.leftShoulder = partB.position;
			 continue;
		 }
		 if (partA.part == 'rightHip' && partB.part == 'rightShoulder') {
		   torso.rightHip = partA.position;
			 continue;
		 }
		 if (partA.part == 'leftShoulder' && partB.part == 'rightShoulder') {

		   torso.rightShoulder = partB.position;
			 continue;
		 }
		 if (partA.part == 'leftHip' && partB.part == 'rightHip') {
		   torso.leftHip = partA.position;
			 continue;
		 }
		 //draw limbs
		 strokeWeight(20);
	   stroke(255, 0, 0, 100);
     line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
   }
	 //draw torso polygon
	 noStroke();
	 beginShape();
	 vertex(torso.leftShoulder.x, torso.leftShoulder.y);
	 vertex(torso.rightShoulder.x, torso.rightShoulder.y);
	 vertex(torso.rightHip.x, torso.rightHip.y);
	 vertex(torso.leftHip.x, torso.leftHip.y);
	 endShape(CLOSE);
	 
	 //draw head
   if(pose != undefined){
    let leftEar = pose.leftEar;
    let rightEar = pose.rightEar;

    let nose = pose.nose;
    let diameter = euclidDist(leftEar.x, leftEar.y, rightEar.x, rightEar.y);
    circle(nose.x, nose.y, diameter);
   }
}

function euclidDist(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2)**2 + (y1 - y2)**2);
}

function setup() {
  createCanvas(640, 480);

  video = createCapture(VIDEO);
  video.size(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;

    for(var i = 0; i < poseUpdatedCallbacks.length; i++){
      poseUpdatedCallbacks[i](poses);
    }
  });
  // Hide the video element, and just show the canvas
	getHoleInScreen(function(){
    // console.log(compareTwoNormalizedPoses(normalizePose(testHolePose1.keypoints), normalizePose(testHolePose2.keypoints)))
  });
  video.hide();
  moveCanvasToChild();
}

function calcSkeletonTranslation(player, pose, skeleton) {
	if (pose != undefined && player != undefined) {
		playerCenter = lineIntersection(player.leftShoulder, player.rightHip, player.leftHip, player.rightShoulder);
		poseHoleCenter = lineIntersection(pose.leftShoulder, pose.rightHip, pose.leftHip, pose.rightShoulder);
		if (!playerCenter || !poseHoleCenter) {
			return;
		}

		// console.log(playerCenter);
		// console.log(poseHoleCenter);
		let xTrans = playerCenter[0] - poseHoleCenter[0];
		let yTrans = playerCenter[1] - poseHoleCenter[1];
		
		let playerCenterDist = euclidDist(playerCenter[0], playerCenter[1], player.rightShoulder.x, player.rightShoulder.y);
		let poseCenterDist = euclidDist(poseHoleCenter[0], poseHoleCenter[1], pose.rightShoulder.x, pose.rightShoulder.y);
		posePlayerScale = playerCenterDist/poseCenterDist;

		var translatedPoseSkeleton = [];
		for (let j = 0; j < skeleton.length; j++) {

			let pointA = skeleton[j][0].position;
			let pointB = skeleton[j][1].position;

			let magA = euclidDist(pointA.x, pointA.y, poseHoleCenter[0], poseHoleCenter[1]);
			let vectorA = [(pointA.x - poseHoleCenter[0]), (pointA.y - poseHoleCenter[1])]

			let magB = euclidDist(pointB.x, pointB.y, poseHoleCenter[0], poseHoleCenter[1]);
			let vectorB = [(pointB.x - poseHoleCenter[0]), (pointB.y - poseHoleCenter[1])]

			translatedPoseSkeleton.push([
				{
				 part: skeleton[j][0].part,
				 position: {
					 x: (poseHoleCenter[0] + xTrans) + (vectorA[0] * posePlayerScale),
					 y: (poseHoleCenter[1] + yTrans) + (vectorA[1] * posePlayerScale)
				 },
				 score: skeleton[j][0].score
				},
				{
				 part: skeleton[j][1].part,
				 position: {
					 x: (poseHoleCenter[0] + xTrans) + (vectorB[0] * posePlayerScale),
					 y: (poseHoleCenter[1] + yTrans) + (vectorB[1] * posePlayerScale)
				 },
				 score: skeleton[j][0].score
				}
			]);
		}
    return translatedPoseSkeleton;
	}
  return null;
}

function lineIntersection(pointA, pointB, pointC, pointD) {
  var z1 = (pointA.x - pointB.x);
  var z2 = (pointC.x - pointD.x);
  var z3 = (pointA.y - pointB.y);
  var z4 = (pointC.y - pointD.y);
  var dist = z1 * z4 - z3 * z2;
  if (dist == 0) {
    return null;
  }
  var tempA = (pointA.x * pointB.y - pointA.y * pointB.x);
  var tempB = (pointC.x * pointD.y - pointC.y * pointD.x);
  var xCoor = (tempA * z2 - z1 * tempB) / dist;
  var yCoor = (tempA * z4 - z3 * tempB) / dist;

  if (xCoor < Math.min(pointA.x, pointB.x) || xCoor > Math.max(pointA.x, pointB.x) ||
    xCoor < Math.min(pointC.x, pointD.x) || xCoor > Math.max(pointC.x, pointD.x)) {
    return null;
  }
  if (yCoor < Math.min(pointA.y, pointB.y) || yCoor > Math.max(pointA.y, pointB.y) ||
    yCoor < Math.min(pointC.y, pointD.y) || yCoor > Math.max(pointC.y, pointD.y)) {
    return null;
  }

  return [xCoor, yCoor];
}

function moveCanvasToChild(){
  var parent = document.getElementById("game")
  var canvas = document.getElementById("defaultCanvas0")

  var canvasContext = canvas.getContext('2d');
  // canvasContext.scale(-1, 1);
  

  parent.appendChild(canvas);
}

function modelReady() {
  select('#status').html('Model Loaded');
}

function draw() {

  image(video, 0, 0, width, height);

  // We can call both functions to draw all keypoints and the skeletons
	// drawHoleInScreen();
  for(var i = 0; i < drawCallbacks.length; i++){
    drawCallbacks[i]();
  }
  drawKeypoints();
  drawSkeleton();

  
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints()  {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
	if (playerCenter) {
		fill(0, 255, 0);
		noStroke();
		ellipse(playerCenter[0], playerCenter[1], 10, 10);
	}
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  // for (let i = 0; i < poses.length; i++) {
  //   let skeleton = poses[i].skeleton;
  //   drawPose(skeleton, (i+1)*10, 255, 0, 0)
  // }
}

function drawPose(skele, weight, r, g, b){
  // For every skeleton, loop through all body connections
  for (let j = 0; j < skele.length; j++) {
    let partA = skele[j][0];
    let partB = skele[j][1];
    strokeWeight(weight);
    stroke(r, g, b);
    
    line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    noStroke();

  }
}
