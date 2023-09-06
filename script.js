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
  const labels = ["suriya"];
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      for (let i = 1; i <= 2; i++) {
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
  let isSuriyaDetected = false; // Flag to track detection status

  // Set a timeout of 10 seconds to send the result to Salesforce
  setTimeout(async () => {
    if (isSuriyaDetected) {
      // Send a POST request to Salesforce indicating "suriya" is detected
      const response = await fetch("https://computing-saas-6446-dev-ed.scratch.my.salesforce.com/_ui/common/apex/debug/ApexCSIPage", {
        method: "POST",
        body: JSON.stringify({ detected: true }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Suriya detected:", response.status);
    } else {
      // Send a POST request to Salesforce indicating "suriya" is not detected
      const response = await fetch("https://computing-saas-6446-dev-ed.scratch.my.salesforce.com/_ui/common/apex/debug/ApexCSIPage", {
        method: "POST",
        body: JSON.stringify({ detected: false }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Suriya not detected:", response.status);
    }
  }, 10000); // 10 seconds

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
        label: result.label,
      });

      if (result.label === "suriya") {
        isSuriyaDetected = true;
      }

      drawBox.draw(canvas);
    });
  }, 100);
});
