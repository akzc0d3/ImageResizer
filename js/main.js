const inputCanvas = document.getElementById("input-canvas");
const inputCanvasContext = inputCanvas.getContext("2d");
const outputCanvas = document.getElementById("output-canvas");
const outputCanvasContext = outputCanvas.getContext("2d");
const cropCanvas = document.getElementById("crop-canvas");
const cropCanvasContext = cropCanvas.getContext("2d");
const widthInp = document.getElementById("imgWidth");
const heightInp = document.getElementById("imgHeight");
const ratioCheckbox = document.getElementById("ratioCheck");
const image = document.getElementById("resized-img");
const dropArea = document.getElementById("input-area");
const uploadBtn = dropArea.querySelector("button");
const uploadHead = dropArea.querySelector(".headers");
const editor = document.getElementById("editor");

const points = [];
let selectedPoint = -1;

image.onload = () => {
  uploadHead.style.display = "none";
  const scale = Math.min(
    inputCanvas.width / image.width,
    inputCanvas.height / image.height
  );
  const x = inputCanvas.width / 2 - (image.width / 2) * scale;
  const y = inputCanvas.height / 2 - (image.height / 2) * scale;
  inputCanvasContext.drawImage(
    image,
    x,
    y,
    image.width * scale,
    image.height * scale
  );

  widthInp.value = image.width;
  heightInp.value = image.height;

  cropCanvas.width = image.width * scale;
  cropCanvas.height = image.height * scale;
  cropCanvas.style.left = x + "px";
  cropCanvas.style.top = y + "px";

  points.push({
    radius: 10,
    x: cropCanvas.width * 20 * 0.01,
    y: cropCanvas.height * 20 * 0.01,
  });
  points.push({
    radius: 10,
    x: cropCanvas.width * 80 * 0.01,
    y: cropCanvas.height * 20 * 0.01,
  });
  points.push({
    radius: 10,
    x: cropCanvas.width * 80 * 0.01,
    y: cropCanvas.height * 80 * 0.01,
  });
  points.push({
    radius: 10,
    x: cropCanvas.width * 20 * 0.01,
    y: cropCanvas.height * 80 * 0.01,
  });
  drawPoints();
};

function loadImage(event) {
  image.src = URL.createObjectURL(event.target.files[0]);
}

const resizeButton = document.getElementById("resize");
resizeButton.addEventListener("click", onResize);

function onResize() {
  const width = parseInt(widthInp.value);
  const height = parseInt(heightInp.value);

  resize(width, height);
}
function resize(width, height) {
  let source = cv.imread(image);
  let destination = new cv.Mat();
  let dsize = new cv.Size(width, height);
  cv.resize(source, destination, dsize, 0, 0, cv.INTER_AREA);
  cv.imshow("output-canvas", destination);
  source.delete();
  destination.delete();

  document.getElementById("output").style.display = "block";
}

document.querySelector("#downloadBtn").addEventListener("click", () => {
  if (window.navigator.msSaveBlob) {
    window.navigator.msSaveBlob(outputCanvas.msToBlob(), "resizedImage.png");
  } else {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = outputCanvas.toDataURL();

    a.download = "ImageResized.png";
    a.click();

    document.body.removeChild(a);
  }

  window.location.reload();
});

widthInp.addEventListener("input", onInputChange);
heightInp.addEventListener("input", onInputChange);

function onInputChange(e) {
  if (ratioCheckbox.checked) {
    if (e.target.id === "imgWidth") {
      const ratio = widthInp.value / image.width;
      heightInp.value = Math.ceil(image.height * ratio);
    } else {
      const ratio = heightInp.value / image.height;
      widthInp.value = Math.ceil(image.width * ratio);
    }
  }
}

ratioCheckbox.addEventListener("change", function () {
  if (this.checked) {
    widthInp.value = image.width;
    heightInp.value = image.height;
  }
});

document.getElementById("input-area").addEventListener("dragover", (e) => {
  e.preventDefault();
});

document.getElementById("input-area").addEventListener("dragleave", (e) => {
  e.preventDefault();
});

document.getElementById("input-area").addEventListener("drop", (e) => {
  e.preventDefault();
  image.src = URL.createObjectURL(e.dataTransfer.files[0]);
});

uploadBtn.addEventListener("click", (e) => {
  document.getElementById("browse-inp").click();
});

if (sessionStorage.getItem("overlaySeen")) {
  document.getElementById("overlay-main").style.display = "none";
} else {
  document.getElementById("overlay-main").style.display = "block";
}

function dissmissOverlay() {
  document.getElementById("overlay-main").style.display = "none";
  sessionStorage.setItem("overlaySeen", "true");
}

editor.addEventListener("change", (e) => {
  if (e.target.value === "crop") {
    showCropEditor();
  } else if (e.target.value === "resize") {
    showResizeEditor();
  }
});
function showResizeEditor() {
  document.getElementById("editor-crop").style.display = "none";
  document.getElementById("editor-resize").style.display = "block";
  cropCanvas.style.display = "none";
}
function showCropEditor() {
  document.getElementById("editor-resize").style.display = "none";
  document.getElementById("editor-crop").style.display = "block";
  cropCanvas.style.display = "block";
}

function drawPoints() {
  cropCanvasContext.clearRect(0, 0, cropCanvas.width, cropCanvas.height);

  points.forEach((cur) => {
    // Create four points
    cropCanvasContext.beginPath();
    cropCanvasContext.arc(cur.x, cur.y, cur.radius, 0, 2 * Math.PI);
    cropCanvasContext.fillStyle = "rgba(0,0,255 , 0.3)";
    cropCanvasContext.fill();
    cropCanvasContext.strokeStyle = "blue";
    cropCanvasContext.stroke();
  });
  cropCanvasContext.beginPath();
  cropCanvasContext.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    cropCanvasContext.lineTo(point.x, point.y);
  }
  cropCanvasContext.strokeStyle = "red";
  cropCanvasContext.closePath();
  cropCanvasContext.stroke();
}

function pointHittest(x, y, pointIndex) {
  var point = points[pointIndex];
  return euclideanDistance(x, y, point.x, point.y) < point.radius;
}
function euclideanDistance(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

cropCanvas.addEventListener("mousedown", (e) => {
  const clickCoordinates = getMousePosition(e.target, e);
  points.forEach((cur, index) => {
    if (pointHittest(clickCoordinates.x, clickCoordinates.y, index)) {
      selectedPoint = index;
    }
  });
});
cropCanvas.addEventListener("mousemove", (e) => {
  if (selectedPoint !== -1) {
    const point = points[selectedPoint];
    point.x = getMousePosition(e.target, e).x;
    point.y = getMousePosition(e.target, e).y;

    drawPoints();
  }
});
cropCanvas.addEventListener("mouseup", (e) => {
  selectedPoint = -1;
});
cropCanvas.addEventListener("mouseout", (e) => {
  selectedPoint = -1;
});

function getMousePosition(canvas, event) {
  let rect = canvas.getBoundingClientRect();

  let x = ++event.clientX - rect.left;
  let y = ++event.clientY - rect.top;
  return { x: Math.abs(x), y: Math.abs(y) };
}

document.getElementById("cropBtn").onclick = (e) => {
  const originalCropCoord = [];
  points.forEach((curr) => {
    const xRatio = curr.x / cropCanvas.width;
    const yRatio = curr.y / cropCanvas.height;
    originalCropCoord.push(image.width * xRatio, image.height * yRatio);
  });
  warp(originalCropCoord);
};

function warp(coordinates) {
  let source = cv.imread(image);
  let destination = new cv.Mat();
  let dsize = new cv.Size(image.width, image.height);
  let sourceTri = cv.matFromArray(4, 1, cv.CV_32FC2, coordinates);
  let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
    0,
    0,
    image.width,
    0,
    image.width,
    image.height,
    0,
    image.height,
  ]);
  let M = cv.getPerspectiveTransform(sourceTri, dstTri);
  cv.warpPerspective(
    source,
    destination,
    M,
    dsize,
    cv.INTER_LINEAR,
    cv.BORDER_CONSTANT,
    new cv.Scalar()
  );
  cv.imshow("output-canvas", destination);
  document.getElementById("output").style.display = "block";

  source.delete();
  destination.delete();
  M.delete();
  sourceTri.delete();
  dstTri.delete();
}
