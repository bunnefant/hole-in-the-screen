const host = "http://localhost:8000"
function getSongDataForGame(){
  // return a list of poses and time stamps
  var songFilePath = "songs/BangarangSkrillex.mp3"
  var poses = []

  var runningTime = 0;
  for(var i = 0; i < 10; i++){
    timeToNext = 3000;
    poses.push({
      time: runningTime,
      timeToNext: timeToNext,
      pose: testHolePose1
    })

    runningTime += timeToNext
  }

  return [songFilePath, poses]
}