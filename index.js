// Inside your app
// import Handsfree from 'handsfree'
// const Handsfree = require("handsfree");
const http = require("http");
const express = require('express')
const app = express()
const host = 'localhost';
const port = 8000;
const path = require('path');
const multer  = require('multer')
var fs = require('fs');

app.use(express.static('public'))
// // Let's enable face tracking with the default Face Pointer
// const handsfree = new Handsfree({weboji: true})
// handsfree.enablePlugins('browser')

// // Now let's start things up
// handsfree.start()

// // Let's create a plugin called "logger"
// // - Plugins run on every frame and is how you "plug in" to the main loop
// // - "this" context is the plugin itself. In this case, handsfree.plugin.logger
// handsfree.use('logger', data => {
//   console.log(data.weboji.morphs, data.weboji.rotation, data.weboji.pointer, data, this)
// })

// // Let's switch to hand tracking now. To demonstrate that you can do this live,
// // let's create a plugin that switches to hand tracking when both eyebrows go up
// handsfree.use('handTrackingSwitcher', ({weboji}) => {
//   if (weboji.state.browsUp) {
//     // Disable this plugin
//     // Same as handsfree.plugin.handTrackingSwitcher.disable()
//     this.disable()

//     // Turn off face tracking and enable hand tracking
//     handsfree.update({
//       weboji: false,
//       hands: true
//     })
//   }
// })

// // You can enable and disable any combination of models and plugins
// handsfree.update({
//   // Disable weboji which is currently running
//   weboji: false,
//   // Start the pose model
//   pose: true,

//   // This is also how you configure (or pre-configure) a bunch of plugins at once
//   plugin: {
//     fingerPointer: {enabled: false},
//     faceScroll: {
//       vertScroll: {
//         scrollSpeed: 0.01
//       }
//     }
//   }
// })

app.get('/', (req, res) => {
  // res.send('Hello World!')
  res.sendFile(path.join(__dirname, '/index.html'));
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

var upload = multer({ dest: './uploads' })

app.post(
  "/upload",
  upload.single("file" /* name attribute of <file> element in your form */),
  (req, res) => {
    // console.log(req)
    const tempPath = "./d.png";
    const targetPath = path.join(__dirname, "./uploads/image.png");

    var img = req.body.file;
    var data = img.replace(/^data:image\/\w+;base64,/, "");
    var buf = Buffer.from(data, 'base64');
    fs.writeFile('./uploads/image'+Math.floor(Math.random() * 1000)+'.png', buf, function(){

    });

  }
);