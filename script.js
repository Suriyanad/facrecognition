const video = document.getElementById("video");
Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
]).then(startWebcam);

function startWebcam() {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((error) => {
      console.error(error);
    });
}

function getLabeledFaceDescriptions() {
  const labels = ["loanOfficer"];
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      for (let i = 4; i <= 12; i++) {
        const img = await faceapi.fetchImage(`./labels/${label}/${i}.jpg`);
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}

video.addEventListener("play", async () => {
  const labeledFaceDescriptors = await getLabeledFaceDescriptions();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);
  let isloanOfficerDetected = false; // Flag to track detection status
  
  let distanceCounter = 0; 
  let unknowncounter = 0;
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video)
      .withFaceLandmarks()
      .withFaceDescriptors();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    resizedDetections.forEach((d) => {
      const result = faceMatcher.findBestMatch(d.descriptor);
      const box = d.detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: "Detecting...",//result.label,
      });
      
      if(result.distance<0.45){
        distanceCounter++;
      } else if(result.distance>0.55){
        unknowncounter++;
      }
      //if (result.label === "loanOfficer") {
      //  isloanOfficerDetected = true;
      //}

      drawBox.draw(canvas);
    });
  }, 100);
  
  // Timeout of 10 seconds to recognize
  setTimeout(async () => {
    //const response = 'true';
    if(distanceCounter>unknowncounter){
      console.log("detected");
      isloanOfficerDetected = true;
    }else{
      console.log("Not detected");
    }
    window.opener.postMessage(isloanOfficerDetected, '*');  
    window.close(); //Close window after detection
}, 10000); // 10 seconds
});
