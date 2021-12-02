import { PpmImage } from '../index';

const displayImage = function(canvas: HTMLCanvasElement) {
    if (!canvas) return;
    let imgStr: string = '';
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const redIndex = y * (canvas.width * 4) + x * 4;
            const greyPixel = (
                imageData.data[redIndex] +
                imageData.data[redIndex + 1] +
                imageData.data[redIndex + 2]
            ) / 3;

            imgStr += greyPixel.toString().padStart(3, ' ') + ' ';
        }
        imgStr += '\n'
    }

    console.log(imgStr);
}

const testPixel = function(canvas: HTMLCanvasElement, x: number, y: number, red: number, green: number, blue: number) {
    if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const redIndex = y * (canvas.width * 4) + x * 4;
            const pixel = [
                imageData.data[redIndex],
                imageData.data[redIndex + 1],
                imageData.data[redIndex + 2],
                imageData.data[redIndex + 3]
            ];

            return (pixel[0] === red && pixel[1] === green && pixel[2] === blue);
        }
    }

    return false;
}

test('Testing P1, P2, P3', () => {
    // https://en.wikipedia.org/wiki/Netpbm
    
    let ppm: PpmImage;
    let canvas: HTMLCanvasElement;

    // P1 with spaces
    const p1Image1 = `P1
    # This is an example bitmap of the letter "J"
    6 10
    0 0 0 0 1 0
    0 0 0 0 1 0
    0 0 0 0 1 0
    0 0 0 0 1 0
    0 0 0 0 1 0
    0 0 0 0 1 0
    1 0 0 0 1 0
    0 1 1 1 0 0
    0 0 0 0 0 0
    0 0 0 0 0 0`;
    ppm = new PpmImage(p1Image1);
    canvas = ppm.getCanvas();
    expect(testPixel(canvas, 4, 0, 0, 0, 0)).toBe(true);
    expect(testPixel(canvas, 4, 7, 255, 255, 255)).toBe(true);

    const p1Image2 = `P1
    # This is an example bitmap of the letter "J"
    6 10
    000010000010000010000010000010000010100010011100000000000000`;
    ppm = new PpmImage(p1Image2);
    expect(testPixel(canvas, 4, 0, 0, 0, 0)).toBe(true);
    expect(testPixel(canvas, 4, 7, 255, 255, 255)).toBe(true);

    const p2Image1 = `P2
    # Shows the word "FEEP" (example from Netpbm man page on PGM)
    24 7
    15
    0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0
    0  3  3  3  3  0  0  7  7  7  7  0  0 11 11 11 11  0  0 15 15 15 15  0
    0  3  0  0  0  0  0  7  0  0  0  0  0 11  0  0  0  0  0 15  0  0 15  0
    0  3  3  3  0  0  0  7  7  7  0  0  0 11 11 11  0  0  0 15 15 15 15  0
    0  3  0  0  0  0  0  7  0  0  0  0  0 11  0  0  0  0  0 15  0  0  0  0
    0  3  0  0  0  0  0  7  7  7  7  0  0 11 11 11 11  0  0 15  0  0  0  0
    0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0  0`;
    ppm = new PpmImage(p2Image1);
    canvas = ppm.getCanvas();
    expect(testPixel(canvas, 5, 1, 0, 0, 0)).toBe(true);
    expect(testPixel(canvas, 4, 1, 51, 51, 51)).toBe(true);

    const p3Image1 = `P3           # "P3" means this is a RGB color image in ASCII
    3 2          # "3 2" is the width and height of the image in pixels
    255          # "255" is the maximum value for each color
    # The part above is the header
    # The part below is the image data: RGB triplets
    255   0   0  # red
      0 255   0  # green
      0   0 255  # blue
    255 255   0  # yellow
    255 255 255  # white
      0   0   0  # black`;
    ppm = new PpmImage(p3Image1);
    canvas = ppm.getCanvas();
    expect(testPixel(canvas, 0, 0, 255, 0, 0)).toBe(true);
    expect(testPixel(canvas, 1, 0, 0, 255, 0)).toBe(true);
    expect(testPixel(canvas, 2, 0, 0, 0, 255)).toBe(true);
    expect(testPixel(canvas, 0, 1, 255, 255, 0)).toBe(true);
    expect(testPixel(canvas, 1, 1, 255, 255, 255)).toBe(true);
    expect(testPixel(canvas, 2, 1, 0, 0, 0)).toBe(true);

    const p3Image2 = `P3
    # The same image with width 3 and height 2,
    # using 0 or 1 per color (red, green, blue)
    3 2 1
    1 0 0   0 1 0   0 0 1
    1 1 0   1 1 1   0 0 0`;
    ppm = new PpmImage(p3Image2);
    canvas = ppm.getCanvas();
    expect(testPixel(canvas, 0, 0, 255, 0, 0)).toBe(true);
    expect(testPixel(canvas, 1, 0, 0, 255, 0)).toBe(true);
    expect(testPixel(canvas, 2, 0, 0, 0, 255)).toBe(true);
    expect(testPixel(canvas, 0, 1, 255, 255, 0)).toBe(true);
    expect(testPixel(canvas, 1, 1, 255, 255, 255)).toBe(true);
    expect(testPixel(canvas, 2, 1, 0, 0, 0)).toBe(true);

    const p3Image3 = `P3 3 2 1  1 0 0   0 1 0   0 0 1  1 1 0   1 1 1   0 0 0`;
    ppm = new PpmImage(p3Image3);
    canvas = ppm.getCanvas();
    expect(testPixel(canvas, 0, 0, 255, 0, 0)).toBe(true);
    expect(testPixel(canvas, 1, 0, 0, 255, 0)).toBe(true);
    expect(testPixel(canvas, 2, 0, 0, 0, 255)).toBe(true);
    expect(testPixel(canvas, 0, 1, 255, 255, 0)).toBe(true);
    expect(testPixel(canvas, 1, 1, 255, 255, 255)).toBe(true);
    expect(testPixel(canvas, 2, 1, 0, 0, 0)).toBe(true);
});

test('Testing P4', () => {
    // http://fejlesztek.hu/pbm-p4-image-file-format/
    let ppm: PpmImage;
    let canvas: HTMLCanvasElement;

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const header1 = encoder.encode('P4 8 4\n');
    const data1 = new Uint8Array([
        ...header1,
        0b01000000,
        0b00110000,
        0b01000000,
        0b00111111
    ]);

    ppm = new PpmImage(decoder.decode(data1));
    canvas = ppm.getCanvas();

    displayImage(canvas);
    expect(testPixel(canvas, 0, 0, 255, 255, 255)).toBe(true);
    expect(testPixel(canvas, 1, 2, 0, 0, 0)).toBe(true);
    expect(testPixel(canvas, 5, 2, 255, 255, 255)).toBe(true);
    expect(testPixel(canvas, 2, 3, 0, 0, 0)).toBe(true);

    const header2 = encoder.encode('P4 5 4\n');
    const data2 = new Uint8Array([
        ...header1,
        0b01000000,
        0b00110000,
        0b01000000,
        0b00111000
    ]);

    ppm = new PpmImage(decoder.decode(data1));
    canvas = ppm.getCanvas();

    displayImage(canvas);
    expect(testPixel(canvas, 0, 0, 255, 255, 255)).toBe(true);
    expect(testPixel(canvas, 1, 2, 0, 0, 0)).toBe(true);
    expect(testPixel(canvas, 4, 2, 255, 255, 255)).toBe(true);
    expect(testPixel(canvas, 2, 3, 0, 0, 0)).toBe(true);
});
