let xCoordDisplay = document.getElementById("x");
let yCoordDisplay = document.getElementById("y");
let countdown = document.getElementById("countdown");

let countdownRunning = false;

function draw() {
    CANVAS_HEIGHT = 300;
    CANVAS_WIDTH = 200;

    var canvas = document.getElementById('canvas');
    if (canvas.getContext) {
      var ctx = canvas.getContext('2d');
    }

    // drawing the array onto the canvas; will have to refactor with API
    var rawArr = [255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, ]
    var imgData = ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
    for (i = 0; i < 100; i += 4) {
        imgData.data[i] = rawArr[i];
        imgData.data[i+1] = rawArr[i+1];
        imgData.data[i+2] = rawArr[i+2];
        imgData.data[i+3] = rawArr[i+3];
    }
    ctx.putImageData(imgData, 0, 0);

    
    canvas.addEventListener('click', function() {
        if (!countdownRunning) {
            startCountdown();
            putColour(event, ctx, imgData);
        } else {
            tryColour(event, ctx);
        }
    });
    canvas.addEventListener('mousemove', displayCoods);
}


function getStartingIndexForCoord(x, y, width) {
    return red = y * (width * 4) + x * 4;
}


function startCountdown() {
    console.log(countdownRunning);
    countdownRunning = true;
    var t = 5;
    countdown.innerText = t; // the setInterval function waits one second before starting
    var interval = setInterval(function() {
        t--;
        countdown.innerText = t;
        if (t == 0) {
            clearInterval(interval);
            countdownRunning = false;
        }
    }, 1000);
}


function putColour(event, ctx, imgData) {
    var x = event.layerX;
    var y = event.layerY;

    var i = getStartingIndexForCoord(x, y, CANVAS_WIDTH);

    // TODO: use selected colour
    imgData.data[i] = 255;
    imgData.data[i+1] = 0;
    imgData.data[i+2] = 0;
    imgData.data[i+3] = 255;

    ctx.putImageData(imgData, 0, 0);
}


function tryColour(event, ctx) {
    alert("You can't put pixels while on cooldown");
}


function displayCoods(event) {
    var x = event.layerX;
    var y = event.layerY;
    xCoordDisplay.innerText = "x: " + x;
    yCoordDisplay.innerText = "y: " + y;
}