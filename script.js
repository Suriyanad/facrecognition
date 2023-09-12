const video = document.getElementById("video");
// Function to get query parameters from the URL
/*function getQueryParameter(parameterName) {
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

// Make an HTTP POST request to the Netlify serverless function
fetch('/.netlify/functions/salesforce', {
  method: 'POST',
  body: JSON.stringify({ accessToken, instanceUrl }),
})
.then(response => response.json())
.then(responseData => {
  if (responseData.success) {
    // Access token and instance URL received from the server
    const accessToken = responseData.accessToken;
    const instanceUrl = responseData.instanceUrl;

    // Now you can use accessToken and instanceUrl in your app
    console.log('Access Token:', accessToken);
    console.log('Instance URL:', instanceUrl);

    // Continue with your app logic
    // ...
  } else {
    // Handle any errors from the server
    console.error('Server returned an error:', responseData.error);
  }
})
.catch(error => {
  console.error('Error sending data to the server:', error);
});
*/
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
  
  //const bearerAccess = 'bearer '+accessToken;
  //console.log(bearerAccess);
  
  // Set a timeout of 10 seconds to send the result to Salesforce
  setTimeout(async () => {
          //const response = 'true';
          window.opener.postMessage(isSuriyaDetected, '*');
    /*if (isSuriyaDetected) {
      // Send a POST request to Salesforce indicating "suriya" is detected
      const postUrlTrue = instanceUrl+'/services/apexrest/Baytree/facerecognition?detected=true';
      const response = await fetch(postUrlTrue, {
        method: "GET",
        //body: { "detected": "true" },
        headers: {
          "Content-Type": "application/json",
          "Authorization": 'Bearer '+accessToken
        },
      });
      console.log("Suriya detected:", response.status);
    } else {
      // Send a POST request to Salesforce indicating "suriya" is not detected
      const postUrlFalse = instanceUrl+'/services/apexrest/Baytree/facerecognition?detected=false';
      const response = await fetch(postUrlFalse, {
        method: "GET",
        //body: { "detected": "false" },
        headers: {
          "Content-Type": "application/json",
          "Authorization": 'Bearer '+accessToken
          
        },
      });
      console.log("Suriya not detected:", response.status);
    }*/
    
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
/*
const video = document.getElementById("video");
const recognitionWindow = window.open('https://comforting-hamster-925641.netlify.app/', '_blank');
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
      const response = await fetch("https://dream-force-2814-dev-ed.scratch.my.salesforce.com/services/apexrest/Baytree/facerecognition", {
        method: "POST",
        body: { "detected": "true" },
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 00D0p0000002ZU3!AQgAQIIyMbhb4245_z7CBMgAOWJHgALDqD95kN301sM6JZrx3U9yx3sW1R8eKWCTyCTL0wWjWEMvxfb6rNMj5C9Pt2ployTF"
        },
      });
      console.log("Suriya detected:", response.status);
    } else {
      // Send a POST request to Salesforce indicating "suriya" is not detected
      const response = await fetch("https://dream-force-2814-dev-ed.scratch.my.salesforce.com/services/apexrest/Baytree/facerecognition", {
        method: "POST",
        body: { "detected": "false" },
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 00D0p0000002ZU3!AQgAQIIyMbhb4245_z7CBMgAOWJHgALDqD95kN301sM6JZrx3U9yx3sW1R8eKWCTyCTL0wWjWEMvxfb6rNMj5C9Pt2ployTF"
          
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
*/
