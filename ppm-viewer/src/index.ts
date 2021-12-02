import { PpmImage, WebImage } from "@cs101/ppm-converter";

const urlSearchParams = new URLSearchParams(window.location.search);
const imageUrl = urlSearchParams.get("image");

const canvasContainer = document.getElementById("canvas");

function convertImage(image: HTMLImageElement) {
  const format = 'P3';
  const pngConverter = new WebImage(image);
  const ppmImageData = pngConverter.getPpm(format);
  renderImage(ppmImageData);

  const link = document.createElement('a');
  const blob = new Blob([ppmImageData], {type: 'image/x-portable-pixmap'});
  link.href = URL.createObjectURL(blob);
  link.target = '_blank';
  link.textContent = 'Download PPM Image';
  document.getElementById('ppmUrl').appendChild(link);
}

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
  if (file.type == 'image/png' || file.type == 'image/jpeg' || file.type == 'image/jpg') {
    const reader = new FileReader();
    reader.onload = function (evt) {
      const image = new Image();
      image.onload = function() {
        convertImage(image);
      }
      image.src = evt.target.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    const reader = new FileReader();
    reader.onload = function (evt) {
      renderImage(evt.target.result as string);
    };
    reader.readAsBinaryString(file);
  }
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
