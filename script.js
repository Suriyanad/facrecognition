/*const video = document.getElementById("video");

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

    const results = resizedDetections.map((d) => {
      return faceMatcher.findBestMatch(d.descriptor);
    });
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: result,
      });
      drawBox.draw(canvas);
    });
  }, 100);
});
*/
const video = document.getElementById("video");
// Function to get query parameters from the URL
function getQueryParameter(parameterName) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get(parameterName);
}

// Get the access token and instance URL from query parameters
const accessToken = getQueryParameter('accessToken');
const instanceUrl = getQueryParameter('instanceUrl');

// Now you can use accessToken and instanceUrl in your app
console.log('Access Token:', accessToken);
console.log('Instance URL:', instanceUrl);

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
  const postUrl = '${instanceUrl}/services/apexrest/Baytree/facerecognition'
  console.log(postUrl);
  // Set a timeout of 10 seconds to send the result to Salesforce
  setTimeout(async () => {
    if (isSuriyaDetected) {
      // Send a POST request to Salesforce indicating "suriya" is detected
      //const postUrl = "${instanceUrl}/services/apexrest/Baytree/facerecognition";
      const response = await fetch(postUrl, {
        method: "POST",
        body: { "detected": "true" },
        headers: {
          "Content-Type": "application/json",
          "Authorization": 'Bearer ${accessToken}'
        },
      });
      console.log("Suriya detected:", response.status);
    } else {
      // Send a POST request to Salesforce indicating "suriya" is not detected
      
      const response = await fetch(postUrl, {
        method: "POST",
        body: { "detected": "false" },
        headers: {
          "Content-Type": "application/json",
          "Authorization": 'Bearer ${accessToken}'
          
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
