const PiCamera = require('pi-camera');
const myCamera = new PiCamera({
  mode: 'video',
  output: `${ __dirname }/video.h264`,
  width: 1920,
  height: 1080,
  timeout: 5000, // Record for 5 seconds
  nopreview: true,
});

myCamera.record()
  .then((result) => {
    // Your video was captured
	console.log(result)
  })
  .catch((error) => {
     // Handle your error
  });