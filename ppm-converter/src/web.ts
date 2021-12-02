
export class WebImage {
    width: number;
    height: number;
    _canvas: HTMLCanvasElement;
    _imageData: ImageData;

    constructor(image: HTMLImageElement) {    
        this.width = 0;
        this.height = 0;
        this._canvas = document.createElement("canvas");
        this._imageData = new ImageData(0, 0);
        this.init(image);
    }

    init(image: HTMLImageElement) {
        if (!image.complete) throw new Error("Image not loaded");

        const ctx = this._canvas.getContext("2d");

        this._canvas.width = image.width;
        this._canvas.height = image.height;

        if (ctx !== null) {
            ctx.drawImage(image, 0, 0);
            this._imageData = ctx.getImageData(0, 0, image.width, image.height);
        }
    }

    getPixel(x: number, y: number) {
        const red = y * (this.width * 4) + x * 4;
        return [
            this._imageData.data[red],
            this._imageData.data[red + 1],
            this._imageData.data[red + 2],
            this._imageData.data[red + 3]
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
        return [format, this._canvas.width.toString(), this._canvas.height.toString(), '255'].join('\n');
    }

    getPpmAscii() {
        const header = this.getPpmHeader('P3');
        let pixelData = '';

        for (let y = 0; y < this._canvas.height; y++) {
            for (let x = 0; x < this._canvas.width; x++) {
                const pixels = this.getPixel(x, y);
                for (let i = 0; i < 3; i++) {
                    pixelData += pixels[i].toString();
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

        for (let y = 0; y < this._canvas.height; y++) {
            for (let x = 0; x < this._canvas.width; x++) {
                const pixels = this.getPixel(x, y);
                for (let i = 0; i < 3; i++) {
                    pixelData += String.fromCharCode(pixels[i]);
                }
            }
        }

        return header + '\n' + pixelData;
    }
}
