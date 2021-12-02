const padStart = function (inputString: string, targetLength: number, padString=' ') {
  let padding = '';
  targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
  if (inputString.length > targetLength) {
    return String(inputString);
  } else {
    targetLength = targetLength - inputString.length;
    while (padding.length <= targetLength) {
      padding += padString
    }
    return padding.slice(0, targetLength) + String(inputString);
  }
};

type ParseState =  "format" | "width" | "height" | "max" | "comment" | "data";

export class PpmImage {
  _data: string;
  _parser: Parser | null;
  _formatter: Formatter | null;
  width: number | null;
  height: number | null;

  constructor(data: string) {
    this._data = data;
    this._parser = null;
    this._formatter = null;

    this.width = null;
    this.height = null;

    this.init();
  }

  parseHeader(data: string) {
    const header = {
      format: "",
      width: "",
      height: "",
      maxVal: ""
    };

    let prevState: ParseState = "format";
    let state: ParseState = "format";
    let dataIndex: number | undefined = undefined;

    for (let i = 0; i < data.length; i++) {
      const char = data.charAt(i);
      const isWhitespace = /\s/.test(char);

      if (char === "#") {
        prevState = state;
        state = "comment";
      }

      if (state === "format") {
        header.format += char;
        if (i === 1) {
          state = "width";
        }
      } else if (state === "comment") {
        if (char === '\n') {
          state = prevState;
        }
      } else if (state === "width") {
        if (isWhitespace && header.width) {
          state = "height";
        } else if (!isWhitespace) {
          header.width += char;
        }
      } else if (state === "height") {
        if (isWhitespace && header.height) {
          if (header.format === "P1" || header.format === "P4") {
            state = "data";
          } else {
            state = "max";
          }
        } else if (!isWhitespace) {
          header.height += char;
        }
      } else if (state === "max") {
        if (isWhitespace && header.maxVal) {
          state = "data";
        } else if (!isWhitespace) {
          header.maxVal += char;
        }
      } else if (state === "data") {
        dataIndex = i;
        break;
      }
    }

    const maxVal = parseInt(header.maxVal, 10)

    return {
      format: header.format,
      width: parseInt(header.width, 10),
      height: parseInt(header.height, 10),
      bytes: header.format === "P1" || header.format === "P4" ? 1 : (maxVal < 256 ? 1 : 2),
      maxVal: maxVal,
      data: dataIndex === undefined ? undefined : data.substring(dataIndex)
    };
  }

  init() {
    const { 
      format, width, height, bytes, maxVal, data
    } = this.parseHeader(this._data);

    if (data) {
      switch (format) {
        case "P1":
          this._parser = new BitStringParser(data);
          this._formatter = new PbmFormatter(width, height);
          break;

        case "P2":
          this._parser = new AsciiParser(data, bytes);
          this._formatter = new PgmFormatter(width, height, maxVal);
          break;

        case "P3":
          this._parser = new AsciiParser(data, bytes);
          this._formatter = new PpmFormatter(width, height, maxVal);
          break;

        case "P4":
          this._parser = new BitParser(data, width);
          this._formatter = new PbmFormatter(width, height);
          break;

        case "P5":
          this._parser = new BinaryParser(data, bytes);
          this._formatter = new PgmFormatter(width, height, maxVal);
          break;

        case "P6":
          this._parser = new BinaryParser(data, bytes);
          this._formatter = new PpmFormatter(width, height, maxVal);
          break;

        default:
          throw new TypeError(`Format not supported: ${format}`);
      }
    } else {
      throw new TypeError("Not a Netpbm file.");
    }
  }

  getPNG() {
    if (this._formatter === null || this._parser === null) {
      throw new Error("Not initialised.");
    }

    const canvas = this._formatter.getCanvas(this._parser);
    return canvas.toDataURL();
  }

  getCanvas() {
    if (this._formatter === null || this._parser === null) {
      throw new Error("Not initialised.");
    }

    return this._formatter.getCanvas(this._parser);
  }
}

interface Parser {
  getNextSample: () => number | false;
}

class BinaryParser implements Parser {
  _data: string;
  _bytes: number;
  _pointer: number;

  constructor(data: string, bytes: number) {
    this._data = data;
    this._bytes = bytes;
    this._pointer = 0;
  }

  getNextSample() {
    if (this._pointer >= this._data.length) return false;

    let val = 0;
    for (let i = 0; i < this._bytes; i++) {
      val = val * 255 + this._data.charCodeAt(this._pointer++);
    }
    return val;
  }
}

class BitParser implements Parser {
  _pointer: number;
  _bits: number[];

  constructor(data: string, width: number) {
    this._pointer = 0;
    this._bits = [];

    this.bytesToBits(data, width);
  }

  bytesToBits(data: string, width: number) {
    let byte: string;
    let col: number;
    let bitIndex: number;

    const sizeOfByte = 8;
    const bitWidth = Math.ceil(width/sizeOfByte) * sizeOfByte;

    this._bits = [];
    col = 0;
    for (let byteIndex = 0; byteIndex < data.length; byteIndex++) {
      byte = padStart(data.charCodeAt(byteIndex).toString(2), sizeOfByte, '0');
      for (let digit = 0; digit < sizeOfByte; digit++) {
        bitIndex = byteIndex * sizeOfByte + digit;
        col = bitIndex % bitWidth;

        if (col < width) {
          // ignore padding bits
          this._bits.push(parseInt(byte[digit], 2));
        }
      }
    }
  }

  getNextSample() {
    if (this._pointer >= this._bits.length) return false;

    const val = this._bits[this._pointer++];
    return 255 * val;
  }
}

class BitStringParser implements Parser {
  _data: string;
  _pointer: number;

  constructor(data: string) {
    this._data = this.cleanText(data);
    this._pointer = 0;
  }

  cleanText(data: string) {
    // remove comments and extraneous whitespace
    // and split into an array
    return data.replace(/#.*/g, '').replace('\n', ' ').replace(/\s+/g, '').trim();
  }

  getNextSample() {
    if (this._pointer >= this._data.length) return false;

    const val = this._data[this._pointer++];
    return 255 * parseInt(val, 10)
  }
}

class AsciiParser implements Parser {
  _data: string[];
  _bytes: number;
  _pointer: number;

  constructor(data: string, bytes: number) {
    this._data = this.cleanText(data);
    this._bytes = bytes;
    this._pointer = 0;
  }

  cleanText(data: string) {
    // remove comments and extraneous whitespace
    // and split into an array
    return data.replace(/#.*/g, '').replace('\n', ' ').replace(/\s+/g, ' ').trim().split(' ');
  }

  getNextSample() {
    if (this._pointer >= this._data.length) return false;

    let val = 0;
    for (let i = 0; i < this._bytes; i++) {
      val = val * 255 + parseInt(this._data[this._pointer++], 10);
    }
    return val;
  }
}

interface Formatter {
  getCanvas: (parser: Parser) => HTMLCanvasElement;
}

class PpmFormatter implements Formatter {
  _width: number;
  _height: number;
  _maxVal: number;

  constructor(width: number, height: number, maxVal: number) {
    this._width = width;
    this._height = height;
    this._maxVal = maxVal;
  }

  getCanvas(parser: Parser) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    let img;

    canvas.width = this._width;
    canvas.height = this._height;
    
    if (ctx === null) {
      throw new Error("No valid context");
    }

    img = ctx.getImageData(0, 0, this._width, this._height);

    for (let row = 0; row < this._height; row++) {
      for (let col = 0; col < this._width; col++) {
        const sampleR = parser.getNextSample() || 0;
        const sampleG = parser.getNextSample() || 0;
        const sampleB = parser.getNextSample() || 0;

        const factor = 255 / this._maxVal;
        const r = factor * sampleR;
        const g = factor * sampleG;
        const b = factor * sampleB;
        const pos = (row * this._width + col) * 4;

        img.data[pos] = r;
        img.data[pos + 1] = g;
        img.data[pos + 2] = b;
        img.data[pos + 3] = 255;
      }
    }

    ctx.putImageData(img, 0, 0);
    return canvas;
  }
}

class PgmFormatter {
  _width: number;
  _height: number;
  _maxVal: number;

  constructor(width: number, height: number, maxVal: number) {
    this._width = width;
    this._height = height;
    this._maxVal = maxVal;
  }

  getCanvas(parser: Parser) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (ctx === null) {
      throw new Error("No valid context");
    }

    let img;

    canvas.width = this._width;
    canvas.height = this._height;

    img = ctx.getImageData(0, 0, this._width, this._height);

    for (let row = 0; row < this._height; row++) {
      for (let col = 0; col < this._width; col++) {
        const sample = parser.getNextSample() || 0;

        const d = sample * (255 / this._maxVal);
        const pos = (row * this._width + col) * 4;

        img.data[pos] = d;
        img.data[pos + 1] = d;
        img.data[pos + 2] = d;
        img.data[pos + 3] = 255;
      }
    }

    ctx.putImageData(img, 0, 0);
    return canvas;
  }
}

class PbmFormatter {
  _width: number;
  _height: number;

  constructor(width: number, height: number) {
    this._width = width;
    this._height = height;
  }

  getCanvas(parser: Parser) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (ctx === null) {
      throw new Error("No valid context");
    }

    canvas.width = this._width;
    canvas.height = this._height;

    const img = ctx.getImageData(0, 0, this._width, this._height);

    for (let row = 0; row < this._height; row++) {
      for (let col = 0; col < this._width; col++) {
        const sample = parser.getNextSample() || 0;
        
        const d = (1 - sample) * 255;
        const pos = (row * this._width + col) * 4;
        img.data[pos] = d;
        img.data[pos + 1] = d;
        img.data[pos + 2] = d;
        img.data[pos + 3] = 255;
      }
    }

    ctx.putImageData(img, 0, 0);
    return canvas;
  }
}

export default PpmImage;
