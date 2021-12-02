# Netpbm

Web viewer and converter for Netpbm files: .pbm, .pgm, .ppm (P1 - P6)
- ppm-converter (library): `npm install @cs101/ppm-converter`
- ppm-viewer: `npm run build` to build with webpack
  - [Demo (with image)](https://d3lo92uftxhq1a.cloudfront.net/ppm/?image=example.ppm)
  - [Demo (with upload)](https://d3lo92uftxhq1a.cloudfront.net/ppm/)

# PPM Converter (Web)
```
import { PpmImage } from "@cs101/ppm-converter";

const imageConverter = new PpmImage(data); // data = byte string

imageConverter.getCanvas() // returns a canvas displaying the PPM file
imageConverter.getPNG()    // returns a b64 DataURI of a PNG

```

# PPM Converter (NodeJS/Sharp)
```
import { PpmImage } from "@cs101/ppm-converter-sharp";

const imageConverter = new PpmImage(data); // data = Uint8Array

const image = imageConverter.getImage() // returns a sharp image

await image.toFile("image.png");

```

## Credits:
Inspiration taken from:
- http://paulcuth.me.uk/netpbm-viewer
- https://en.wikipedia.org/wiki/Netpbm
- http://fejlesztek.hu/pbm-p4-image-file-format/ (to implement P1 and P4 correctly)
