function Sobel(imageData) {
    if (!(this instanceof Sobel)) {
        return new Sobel(imageData);
    }

    var width = imageData.width;
    var height = imageData.height;

    var kernelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];

    var kernelY = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ];

    var sobelData = [];
    var grayscaleData = [];

    function bindPixelAt(data) {
        return function (x, y, i) {
            i = i || 0;
            return data[((width * y) + x) * 4 + i];
        };
    }

    var data = imageData.data;
    var pixelAt = bindPixelAt(data);
    var x, y;

    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
            var r = pixelAt(x, y, 0);
            var g = pixelAt(x, y, 1);
            var b = pixelAt(x, y, 2);

            var avg = (r + g + b) / 3;
            grayscaleData.push(avg, avg, avg, 255);
        }
    }

    pixelAt = bindPixelAt(grayscaleData);

    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
            var pixelX = (
                (kernelX[0][0] * pixelAt(x - 1, y - 1)) +
                (kernelX[0][1] * pixelAt(x, y - 1)) +
                (kernelX[0][2] * pixelAt(x + 1, y - 1)) +
                (kernelX[1][0] * pixelAt(x - 1, y)) +
                (kernelX[1][1] * pixelAt(x, y)) +
                (kernelX[1][2] * pixelAt(x + 1, y)) +
                (kernelX[2][0] * pixelAt(x - 1, y + 1)) +
                (kernelX[2][1] * pixelAt(x, y + 1)) +
                (kernelX[2][2] * pixelAt(x + 1, y + 1))
            );

            var pixelY = (
                (kernelY[0][0] * pixelAt(x - 1, y - 1)) +
                (kernelY[0][1] * pixelAt(x, y - 1)) +
                (kernelY[0][2] * pixelAt(x + 1, y - 1)) +
                (kernelY[1][0] * pixelAt(x - 1, y)) +
                (kernelY[1][1] * pixelAt(x, y)) +
                (kernelY[1][2] * pixelAt(x + 1, y)) +
                (kernelY[2][0] * pixelAt(x - 1, y + 1)) +
                (kernelY[2][1] * pixelAt(x, y + 1)) +
                (kernelY[2][2] * pixelAt(x + 1, y + 1))
            );

            var magnitude = Math.sqrt((pixelX * pixelX) + (pixelY * pixelY)) >>> 0;

            sobelData.push(magnitude, magnitude, magnitude, 255);
        }
    }

    var clampedArray = sobelData;

    if (typeof Uint8ClampedArray === 'function') {
        clampedArray = new Uint8ClampedArray(sobelData);
    }

    clampedArray.toImageData = function () {
        return Sobel.toImageData(clampedArray, width, height);
    };

    return clampedArray;
}

function toImageData(data, width, height) {
    if (typeof ImageData === 'function' && Object.prototype.toString.call(data) === '[object Uint16Array]') {
        return new ImageData(data, width, height);
    } else {
        if (typeof window === 'object' && typeof window.document === 'object') {
            var canvas = document.createElement('canvas');

            if (typeof canvas.getContext === 'function') {
                var context = canvas.getContext('2d');
                var imageData = context.createImageData(width, height);
                imageData.data.set(data);
                return imageData;
            } else {
                return new FakeImageData(data, width, height);
            }
        } else {
            return new FakeImageData(data, width, height);
        }
    }
};

function FakeImageData(data, width, height) {
    return {
        width: width,
        height: height,
        data: data
    };
}


let video, c1, ctx1, c_tmp, ctx_tmp;
function init() {
    video = document.getElementById('video');
    c1 = document.getElementById('output-canvas');
    ctx1 = c1.getContext('2d');
    c_tmp = document.createElement('canvas');
    c_tmp.setAttribute('width', 1280);
    c_tmp.setAttribute('height', 720);
    ctx_tmp = c_tmp.getContext('2d');
    video.addEventListener('play', computeFrame);
}

function computeFrame() {
    ctx_tmp.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    let frame = ctx_tmp.getImageData(0, 0, video.videoWidth, video.videoHeight);

    // sobel cho tung hinh anh
    // Sobel constructor returns an Uint8ClampedArray with sobel data
    var sobelData = Sobel(frame);
    // [sobelData].toImageData() returns a new ImageData object
    var sobelImageData = toImageData(sobelData,video.videoWidth,video.videoHeight);

    ctx1.putImageData(sobelImageData, 0, 0);
    setTimeout(computeFrame, 0);
}

document.addEventListener("DOMContentLoaded", () => {
    init();
});

