const host = "http://localhost:8000"
function getSongDataForGame(){
  // return a list of poses and time stamps
  const songList = ["BarbieGirl", "BumbleBee", "PinkDinosaur", "Sandstorm"]
  const songStartTimes = [10000, 16000, 15000, 15550]
  const songNextTimes = [3600, 3500, 3500, 3550]
  const randomIndex = Math.floor(Math.random() * songList.length)
  var songFilePath = "songs/" + songList[randomIndex] + ".mp3"
  var choices = Object.keys(allPoses)
  console.log(choices)
  var poses = []

  var runningTime = 0;
  for(var i = 0; i < 10; i++){
    timeToNext = songNextTimes[randomIndex];
    poses.push({
      time: runningTime,
      timeToNext: timeToNext,
      pose: choices[Math.floor(Math.random()*choices.length)]
    })

    runningTime += timeToNext
  }

  var firstPoseStartTime = songStartTimes[randomIndex];
  return [songFilePath, poses, firstPoseStartTime]
}