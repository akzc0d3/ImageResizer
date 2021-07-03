const inputCanvas = document.getElementById("input-canvas");
const inputCanvasContext = inputCanvas.getContext("2d");
const outputCanvas = document.getElementById("output-canvas");
const outputCanvasContext = outputCanvas.getContext("2d");
const widthInp = document.getElementById("imgWidth");
const heightInp = document.getElementById("imgHeight");
const ratioCheckbox = document.getElementById("ratioCheck")
const image = document.getElementById("resized-img");
const dropArea = document.getElementById('input-area');
const uploadBtn = dropArea.querySelector('button');
const uploadHead = dropArea.querySelector('.headers');

image.onload = () => {

  uploadHead.style.display= "none";
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
};

function loadImage(event) {
  image.src = URL.createObjectURL(event.target.files[0]);
}

const resizeButton = document.getElementById("resize");
resizeButton.addEventListener("click", onResize);

function onResize(){
  const width = parseInt(widthInp.value);
  const height = parseInt(heightInp.value);

  resize(width,height);
  
}
function resize(width,height) {
  let source = cv.imread(image);
  let destination = new cv.Mat();
  let dsize = new cv.Size(width, height);
  cv.resize(source, destination, dsize, 0, 0, cv.INTER_AREA);
  cv.imshow("output-canvas", destination);
  source.delete();
  destination.delete();
  
  document.getElementById('output').style.display = "block";
  
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

widthInp.addEventListener('input',onInputChange);
heightInp.addEventListener('input',onInputChange);

function onInputChange(e){

  if(ratioCheckbox.checked){

    
    if(e.target.id === 'imgWidth'){
      const ratio = widthInp.value / image.width;
      heightInp.value = Math.ceil(image.height*ratio); 
    }else{
      const ratio = heightInp.value / image.height;
      widthInp.value = Math.ceil(image.width*ratio); 
    }
  }

}

ratioCheckbox.addEventListener('change', function() {
  if (this.checked) {
    widthInp.value = image.width; 
    heightInp.value = image.height; 
  } 
});

document.getElementById('input-area').addEventListener('dragover', (e)=>{
  e.preventDefault();
  console.log('dragover');
})

document.getElementById('input-area').addEventListener('dragleave', (e)=>{
  e.preventDefault();
  console.log('dragleave');
})

document.getElementById('input-area').addEventListener('drop', (e)=>{
  e.preventDefault();
  image.src = URL.createObjectURL(e.dataTransfer.files[0]);

})

uploadBtn.addEventListener('click', (e)=>{
  document.getElementById('browse-inp').click();
})

if (sessionStorage.getItem("overlaySeen")) {
  document.getElementById("overlay-main").style.display = "none";
} else {
  document.getElementById("overlay-main").style.display = "block";
}


function dissmissOverlay() {
  document.getElementById("overlay-main").style.display = "none";
  sessionStorage.setItem("overlaySeen", "true");
}
