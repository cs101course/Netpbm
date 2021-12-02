import { PpmImage, WebImage } from "@cs101/ppm-converter";

const urlSearchParams = new URLSearchParams(window.location.search);
const imageUrl = urlSearchParams.get("image");

const canvasContainer = document.getElementById("canvas");

function convertImage(image: HTMLImageElement, filename: string) {
  const filenameParts = filename.split('.');

  filenameParts[filenameParts.length - 1] = 'p3.ppm';

  const newFilenameP3 = filenameParts.join('.');

  filenameParts[filenameParts.length - 1] = 'p6.ppm';

  const newFilenameP6 = filenameParts.join('.');

  const formatConverter = new WebImage(image);
  const ppmImageDataP6 = formatConverter.getPpm('P6');
  const ppmImageDataP3 = formatConverter.getPpm('P3');
  renderImage(ppmImageDataP6);

  document.getElementById('ppmUrl').innerHTML = '';

  const linkP3 = document.createElement('a');
  const blobP3 = new Blob([ppmImageDataP3], {type: 'image/x-portable-pixmap'});
  linkP3.href = URL.createObjectURL(blobP3);
  linkP3.target = '_blank';
  linkP3.textContent = 'Download PPM Image (P3)';
  linkP3.download = newFilenameP3;
  document.getElementById('ppmUrl').appendChild(linkP3);

  document.getElementById('ppmUrl').appendChild(
    document.createElement('br')
  );

  const linkP6 = document.createElement('a');
  const blobP6 = new Blob([ppmImageDataP6], {type: 'image/x-portable-pixmap'});
  linkP6.href = URL.createObjectURL(blobP6);
  linkP6.target = '_blank';
  linkP6.textContent = 'Download PPM Image (P6)';
  linkP6.download = newFilenameP6;
  document.getElementById('ppmUrl').appendChild(linkP6);
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
        convertImage(image, file.name);
      }
      image.src = evt.target.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    document.getElementById('ppmUrl').innerHTML = '';
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
