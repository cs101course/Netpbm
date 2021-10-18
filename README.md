# Netpbm

Web viewer and converter for Netpbm files: .pbm, .pgm, .ppm (P1 - P6)
- ppm-converter (library): `npm install @cs101/ppm-converter`
- ppm-viewer: `npm run build` to build with webpack

# PPM Converter
```
import { PpmImage } from "@cs101/ppm-converter";

const imageConverter = new PpmImage(data); // data = byte string

imageConverter.getCanvas() // returns a canvas displaying the PPM file
imageConverter.getPNG()    // returns a b64 DataURI of a PNG

```
