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
			holePose = data.pose1.skeleton;

      testHolePose1 = data.pose1.pose;
      // testHolePose2 = data.pose2.pose;
      completion();
		});
}

function drawHoleInScreen() {

  // Loop through all the skeletons detected
	 let skeleton = holePose.skeleton ? holePose.skeleton : [];
  //  console.log("draw hole "+JSON.stringify(skeleton))
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
	 let leftEar = holePose.pose.leftEar;
	 let rightEar = holePose.pose.rightEar;

	 let nose = holePose.pose.nose;
	 let diameter = Math.sqrt((leftEar.x - rightEar.x)**2 + (leftEar.y - rightEar.y)**2);
	 circle(nose.x, nose.y, diameter);
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

		if (poses.length == 2) {
			// console.log(poses);
		}
  });
  // Hide the video element, and just show the canvas
	getHoleInScreen(function(){
    // console.log(compareTwoNormalizedPoses(normalizePose(testHolePose1.keypoints), normalizePose(testHolePose2.keypoints)))
  });
  video.hide();
  moveCanvasToChild();
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
	drawHoleInScreen();
  drawKeypoints();
  drawSkeleton();

  for(var i = 0; i < drawCallbacks.length; i++){
    drawCallbacks[i]();
  }
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
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
		  strokeWeight(1);
      stroke(255, 0, 0);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}
