
export class WebImage {
    _canvas: HTMLCanvasElement;
    _imageData: ImageData | null;

    constructor(image: HTMLImageElement) {    
        this._canvas = document.createElement("canvas");
        this._imageData = null;
        this.init(image);
    }

    init(image: HTMLImageElement) {
        if (!image.complete) throw new Error("Image not loaded");

        const ctx = this._canvas.getContext("2d");

        if (ctx === null) throw new Error("Context not initialised");

        this._canvas.width = image.width;
        this._canvas.height = image.height;

        ctx.drawImage(image, 0, 0, image.width, image.height);
        this._imageData = ctx.getImageData(0, 0, image.width, image.height);
    }

    getPixel(x: number, y: number) {
        if (this._imageData === null) throw new Error("Image not loaded");

        const width = this._canvas.width;
        const redIndex = y * (width * 4) + x * 4;
        return [
            this._imageData.data[redIndex],
            this._imageData.data[redIndex + 1],
            this._imageData.data[redIndex + 2],
            this._imageData.data[redIndex + 3]
        ];
    }

    getPpm(format: string) {
        if (format === 'P3') {
            return this.getPpmAscii();
        } else if (format === 'P6') {
            return this.getPpmBinary();
        }

        return null;
    }

    getPpmHeader(format: string) {
        return [format, this._canvas.width.toString() + ' ' + this._canvas.height.toString(), '255'].join('\n');
    }

    getPpmAscii() {
        const header = this.getPpmHeader('P3');
        let pixelData = '';
        let pixel: number[];

        for (let y = 0; y < this._canvas.height; y++) {
            for (let x = 0; x < this._canvas.width; x++) {
                pixel = this.getPixel(x, y);
                for (let i = 0; i < 3; i++) {
                    pixelData += pixel[i].toString();
                    if (i == 2) {
                        pixelData += '\n';
                    } else {
                        pixelData += ' ';
                    }
                }
            }
        }

        return header + '\n' + pixelData;
    }

    getPpmBinary() {
        const header = this.getPpmHeader('P6');
        let pixelData = '';
        let pixel: number[];

        for (let y = 0; y < this._canvas.height; y++) {
            for (let x = 0; x < this._canvas.width; x++) {
                pixel = this.getPixel(x, y);
                for (let i = 0; i < 3; i++) {
                    pixelData += String.fromCharCode(pixel[i]);
                }
            }
        }

        return header + '\n' + pixelData;
    }
}
