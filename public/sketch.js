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

let testHolePose1;
let testHolePose2;

function getHoleInScreen(completion) {
	fetch('screenHoles.json')
		.then(resp => resp.json())
		.then(data => {
			holePose = data.pose1.skeleton;
		});
}


function drawHoleInScreen() {
  // Loop through all the skeletons detected
   for (let j = 0; j < holePose.length; j++) {
     let partA = holePose[j][0];
     let partB = holePose[j][1];
		 strokeWeight(10);
     stroke(255, 0, 0);
     line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
   }
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
		if (poses.length == 2) {
			console.log(poses);
		}
  });
  // Hide the video element, and just show the canvas
	getHoleInScreen(function(){
    console.log(compareTwoNormalizedPoses(normalizePose(testHolePose1), normalizePose(testHolePose2)))
  });
  video.hide();
  moveCanvasToChild();
}

function moveCanvasToChild(){
  var parent = document.getElementById("game")
  var canvas = document.getElementById("defaultCanvas0")
  parent.appendChild(canvas);
}

function modelReady() {
  select('#status').html('Model Loaded');
}

function draw() {
  image(video, 0, 0, width, height);

  // We can call both functions to draw all keypoints and the skeletons
	// drawHoleInScreen();
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
