
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
}