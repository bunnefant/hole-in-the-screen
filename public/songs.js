const host = "http://localhost:8000"
function getSongDataForGame(){
  // return a list of poses and time stamps
  var songFilePath = "songs/BarbieGirl.mp3"
  var choices = Object.keys(allPoses)
  console.log(choices)
  var poses = []

  var runningTime = 0;
  for(var i = 0; i < 10; i++){
    timeToNext = 3000;
    poses.push({
      time: runningTime,
      timeToNext: timeToNext,
      pose: choices[Math.floor(Math.random()*choices.length)]
    })

    runningTime += timeToNext
  }

  var firstPoseStartTime = 3000;
  return [songFilePath, poses, firstPoseStartTime]
}