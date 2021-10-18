import { PpmImage } from "@cs101/ppm-converter";

const urlSearchParams = new URLSearchParams(window.location.search);
const imageUrl = urlSearchParams.get("image");

const canvasContainer = document.getElementById("canvas");

function renderImage(data: string) {
  const imageConverter = new PpmImage(data);
  const canvas = imageConverter.getCanvas();
  const width = canvas.width;
  const height = canvas.height;
  console.log(width, height);
  canvasContainer.innerHTML = "";
  canvasContainer.appendChild(canvas);
  canvas.style.width = "50%";

  document.getElementById("actualButton").addEventListener("click", function() {
    canvas.style.width = width + "px";
  });

  document.getElementById("zoom50Button").addEventListener("click", function() {
    canvas.style.width = "50%";
  });

  document.getElementById("zoom100Button").addEventListener("click", function() {
    canvas.style.width = "100%";
  })

  document.getElementById("tools").style.display = "block";
}

function loadFromUrl(url: string) {
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.textContent = url.split('/').slice(-1)[0];
  document.getElementById('ppmUrl').appendChild(link);
  fetch(url)
    .then(function (response) {
      return response.text();
    })
    .then(renderImage);
}

function loadFromFile(file: File) {
  const reader = new FileReader();
  reader.onload = function (evt) {
    renderImage(evt.target.result as string);
  };
  reader.readAsBinaryString(file);
}

if (imageUrl) {
  loadFromUrl(imageUrl);
} else {
  const fileInput = document.getElementById("fileInput");
  fileInput.style.display = 'block';
  fileInput.addEventListener('change', function() {
    const fileInput = this as HTMLInputElement;
    const file = fileInput.files[0];
    loadFromFile(file);
  });
}
