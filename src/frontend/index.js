
// var socket = io.connect();

var xCoordDisplay = document.getElementById("x");
var yCoordDisplay = document.getElementById("y");
var countdownSec = document.getElementById("countdown-s");
var countdownMin = document.getElementById("countdown-m");
var accPixels = document.getElementById("accPixels");

var countdownRunning = false;
var cooldownTime = 5; // in seconds

// these will change with zooming and scrolling around
var currentZoom = 1; // default zoom is 2 
var startX = 0; // leftmost canvas x-coordinate displayed
var startY = 0; // topmost canvas y-coordinate displayed

var numberOfAccumulatedPixels = new accumulatedPixels(0);

var startTime;

var currentColour = "RED";

const DISP_TO_CANVAS_SCALE = 512/128;

function draw() {
    // for the actual image data
    CANVAS_HEIGHT = 128;
    CANVAS_WIDTH = 128;

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    var memCvs = new OffscreenCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    var memCtx = memCvs.getContext('2d');

    var myImgData = memCtx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT); // might change to global variable

    // API requests
    function httpGetAsync(theUrl, callback) {
        var xmlHttp = new XMLHttpRequest();

        xmlHttp.onload = function() { 
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback(xmlHttp.response);
        }
        xmlHttp.open("GET", theUrl, true);
        xmlHttp.responseType = "json";
        xmlHttp.send(null);
    }

    function httpGetBinary(theUrl, callback) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theUrl, true);
        xmlHttp.responseType = "arraybuffer";

        xmlHttp.onload = function() {
            var arrayBuffer = xmlHttp.response; // note: NOT responseText
            // if unsuccessful, arrayBuffer will be null
            if (arrayBuffer) {
                callback(arrayBuffer);
            }
        }
        xmlHttp.send(null);
    }

    function bitfieldToImgData(grid) {
        // grid is raw binary data: 4 bits for one pixel, like "0000", so 2 pixels in 1 byte
        // first thing to map to: higher and lower nibbles in each byte
        // map the to 32-bit colours, i.e. r g b a each being one byte 
        // finally 8-bit unsigned int array used by imgData

        // directly changes myImgData variable
        const gridValue = Object.values(grid.grid);
        console.log("grid callback reached");
        // console.log(bitfieldGrid);
        // console.log(String.fromCharCode.apply(null, new Uint8Array(grid)));
        // console.log(Object.values(grid));
        var view = Uint8Array.from(gridValue);
        console.log(view);
        var rgbaArr = new Uint32Array(128*128);
        for (let i = 0; i < view.length; i++) {
            // iterates over each byte to separate into the two bits
            var num = view[i]; // gives an integer between 0 and 255
            var nibble1 = (num & 0xF0) >> 4; // 0xF0 == '11110000' 
            var nibble2 = num & 0x0F // 0x0F == '00001111'
            // console.log(nibble1); // 0111 == 7?
            // console.log(nibble2); // 1011 == 11?
            var color1 = ColorIndex[nibble1];
            var color2 = ColorIndex[nibble2];
            // console.log(color1);
            // console.log(color2);
            var rgba1 = ColorRGB[color1];
            var rgba2 = ColorRGB[color2];
            rgbaArr[i*2] = 255 << 24 + rgba1[2] << 16 + rgba1[1] << 8 + rgba1[0];
            rgbaArr[i*2 + 1] = 255 << 24 + rgba2[2] << 16 + rgba2[1] << 8 + rgba2[0];
        }

        console.log(rgbaArr);

        myImgData.data.set(rgbaArr);
    }

    const userUrl = window.location.href.split("/"); 
    // const userId = userUrl[userUrl.length - 1];
    const userId = '250437415';
    let chatId;

    function initUserVariables(userVariables) {
        // {
        //     telegram_id: '250437415',
        //    group_id: blabla,
        //     last_updated: 2020-07-21T15:27:41.215Z,
        //     accumulated_pixels: 0,
        //     notifications: true
        //   }
        console.log(userVariables);
        // console.log("init user variables reached");
        chatId = userVariables["group_id"];

        numberOfAccumulatedPixels.setPixels(userVariables["accumulated_pixels"]);
        const lastUpdated = new Date(userVariables["last_updated"]);
        const gap = new Date() - lastUpdated; // in ms
        numberOfAccumulatedPixels.addPixels(Math.floor(gap / ACCUMULATED_PIXEL_GAP));
        console.log("initialised number of pixels: ");
        updateAccPixels();
        
        // TODO: init cooldown timing
        startTime = new Date();
        // if timestamp was <5 mins of now, need to calculate cooldown timing; if not 5 mins
    }

    httpGetAsync(`https://tplace.xyz/api/user/${userId}`, initUserVariables);
    httpGetAsync("https://tplace.xyz/api/grid", bitfieldToImgData);
    
    // var rawArr = [255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, ]
    // bitfieldToImgData(rawArr);

    function redraw(imgData, scale) {
        // TODO: I THINK CAN REMOVE THE PARAMETERS CUZ I JUST USE myImgData and currentZoom all the time?
        // clear canvas
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

        // putting grey gridlines on imgData
        // every 5 pixels, if it's a white square, make it grey
        for (let r = 0; r < 128; r++) {
            if ((r+1) % 5 == 0) {
                // every 5th row
                for (let c = 0; c < 128*4; c += 4) {
                    if (imgData.data[r*128*4 + c] == 255 && imgData.data[r*128*4 + c+1] == 255 && imgData.data[r*128*4 + c+2] == 255) {
                        imgData.data[r*128*4 + c] = 211;
                        imgData.data[r*128*4 + c+1] = 211;
                        imgData.data[r*128*4 + c+2] = 211;
                        imgData.data[r*128*4 + c+3] = 255;
                    }
                }
            }
            for (let c = 16; c < 128*4; c += 20) {
                // every 5th column
                if (imgData.data[r*128*4 + c] == 255 && imgData.data[r*128*4 + c+1] == 255 && imgData.data[r*128*4 + c+2] == 255) {
                    imgData.data[r*128*4 + c] = 211;
                    imgData.data[r*128*4 + c+1] = 211;
                    imgData.data[r*128*4 + c+2] = 211;
                    imgData.data[r*128*4 + c+3] = 255;
                }
            }
        }
        
        // update memCtx with new image data  
        memCtx.putImageData(imgData, 0, 0);
        ctx.drawImage(memCvs, startX, startY, CANVAS_WIDTH/scale, CANVAS_HEIGHT/scale, 0, 0, canvas.clientWidth, canvas.clientHeight);

        // TODO: put black border around image?
    }
    redraw(myImgData, currentZoom);

    // ZOOMING 
    function zoom(delta, absX, absY) {
        // absX and absY are the coordinates where the mouse is at when zooming
        var scaleFactor = 1.1;
        var factor = Math.pow(scaleFactor, delta);

        currentZoom *= factor;
        startX = absX - (absX-startX)/factor;
        startY = absY - (absY-startY)/factor;
        console.log(currentZoom, startX, startY, absX, absY);
        
        redraw(myImgData, currentZoom);
    }
    function handleScroll(event) {
        [absX, absY] = getCurrentCoods(event);
        var delta = event.wheelDelta ? event.wheelDelta/40 : event.detail ? -event.detail : 0;
        if (delta) {
            zoom(delta, absX, absY);
            displayCoods(event);
        }
        return event.preventDefault() && false;
    };
    canvas.addEventListener('DOMMouseScroll', handleScroll, false);
    canvas.addEventListener('mousewheel', handleScroll, false);


    // DRAGGING AND CLICKING
    var dragStart, dragged;
    var lastX, lastY;
    var hasSelectedPixel;
    function downDrag(evt) {
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        dragStart = {x: lastX, y: lastY};
        dragged = true;
    }
    function moveDrag(evt) {
        if (dragged) {
            console.log('drag');
            currX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
            currY = evt.offsetY || (evt.pageY - canvas.offsetTop);
            deltaX = currX - lastX;
            deltaY = currY - lastY;
            // updating canvas
            startX -= deltaX/DISP_TO_CANVAS_SCALE / currentZoom;
            startY -= deltaY/DISP_TO_CANVAS_SCALE / currentZoom;
            redraw(myImgData, currentZoom);
            // updating lastX and lastY
            lastX = currX;
            lastY = currY;
        }
    }
    function upDrag(evt) {
        minDelta = 5; // i.e. more than 5 pixels movement consider drag
        currX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        currY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        totalDeltaX = currX - dragStart.x;
        totalDeltaY = currY - dragStart.y;
        if (Math.abs(totalDeltaX) > minDelta || Math.abs(totalDeltaY) > minDelta) {
            // END DRAG; updating canvas
            console.log('dragMouseUp');
            startX -= (currX - lastX)/DISP_TO_CANVAS_SCALE / currentZoom;
            startY -= (currY - lastY)/DISP_TO_CANVAS_SCALE / currentZoom;
            redraw(myImgData, currentZoom);
            dragStart = null;
            dragged = false;
        } else {
            // CLICK
            console.log('click');
            dragged = false;

            if (hasSelectedPixel) {
                // won't put a colour
                console.log("there is already a selected pixel");
            } else {
                [x, y] = getCurrentCoods(evt);
                if (x < 0 || x >= CANVAS_WIDTH || y < 0 || y >= CANVAS_HEIGHT) {
                    // pixel out of range; won't put a colour 
                    var popup = document.getElementById("outofrange-popup");
                    popup.style.left = `${evt.pageX-8}px`;
                    popup.style.top = `${evt.pageY+1}px`;
                    popup.classList.toggle('show');
    
                    var okBtn = document.getElementById("ok2");
                    okBtn.onclick = function(){
                        popup.classList.toggle('show');
                    }
                } else {
                    var originalPixel = putColour([x, y], myImgData); // destructively changes myImgData but returned "backup" of changed pixel
                    redraw(myImgData, currentZoom);        
                    hasSelectedPixel = true;
                    
                    if (Math.floor(numberOfAccumulatedPixels.getPixels()) > 0) {
                        var popup = document.getElementById("confirm-popup");
                        popup.style.left = `${evt.pageX-8}px`;
                        popup.style.top = `${evt.pageY+1}px`;
                        // maybe figure out a way to better set the popup location?
                        popup.classList.toggle('show');

                        var confirmBtn = document.getElementById("confirm");
                        confirmBtn.onclick = function() {
                            confirmColour(x, y, chatId, userId);
                            console.log(x, y);
                            if (Math.floor(numberOfAccumulatedPixels.getPixels()) == 1) {
                                // last accumulated pixel used
                                startCountdown();
                            }
                            hasSelectedPixel = false;
                        }
                        var cancelBtn = document.getElementById("cancel");
                        cancelBtn.onclick = function(){
                            cancelColour(myImgData, originalPixel);
                            popup.classList.toggle('show');
                            hasSelectedPixel = false;
                        };
                    } else { // on cooldown, 0 accumulated pixels
                        var popup = document.getElementById("cooldown-popup");
                        popup.style.left = `${evt.pageX-8}px`;
                        popup.style.top = `${evt.pageY+1}px`;
                        popup.classList.toggle('show');
        
                        var okBtn = document.getElementById("ok");
                        okBtn.onclick = function(){
                            cancelColour(myImgData, originalPixel);
                            popup.classList.toggle('show');
                            hasSelectedPixel = false;
                        }
                    }
                }
            }
        }
    };
    canvas.addEventListener('mousedown', downDrag(evt),false);
    canvas.addEventListener('mousemove', moveDrag(evt),false);
    canvas.addEventListener('mouseup', upDrag(evt),false);
    canvas.addEventListener('touchstart', downDrag(evt),false);
    canvas.addEventListener('touchmove', moveDrag(evt),false);
    canvas.addEventListener('touchend', upDrag(evt),false);

    function confirmColour(x, y, chatId, userId) { 
        console.log("Confirmed colour");
        var cfm_popup = document.getElementById("confirm-popup");
        cfm_popup.classList.toggle('show');
        numberOfAccumulatedPixels.subtractPixels(1);
        updateAccPixels();

        // TODO: POST REQUEST with data of new pixel 
        let xhr = new XMLHttpRequest(); 
        let url = `https://tplace.xyz/api/grid/${chatId}/${userId}`; 
        xhr.open("POST", url, true); 
        xhr.setRequestHeader("Content-Type", "application/json"); 

        // xhr.onreadystatechange = function() { 
        //     if (xhr.readyState === 4 && xhr.status === 200) { 
        //         // Print received data from server 
        //         console.log(this.responseText);
        //     }
        // }; 
        // Sending JSON object
        var now = new Date();
        // var r = ColorRGB.currentColour[0];
        // var g = ColorRGB.currentColour[1];
        // var b = ColorRGB.currentColour[2];
        var r = 0;
        var g = 0;
        var b = 255;
        
        var data = JSON.stringify({ "x": x+1, "y": y+1, "r": r, "g": g, "b": b, "a": 255, "timestamp": now, "accumulated_pixels": numberOfAccumulatedPixels.getPixels(), "color": Color[currentColour] }); 
        console.log(data);
        xhr.send(data); 
    }
    function cancelColour(imgData, originalPixel) {
        console.log("Go back go back go back");
        var i = originalPixel.i;
        imgData.data[i] = originalPixel.r;
        imgData.data[i+1] = originalPixel.g;
        imgData.data[i+2] = originalPixel.b;
        imgData.data[i+3] = originalPixel.a;
        redraw(imgData, currentZoom);
    }

    canvas.addEventListener('mousemove', displayCoods);


    var previousColour = 0;
    function colourPanelListeners(number) {
        var col = document.getElementById(`${number}`);
        col.onclick = function(){ 
            col.style["stroke-width"]="3px";
            // reset previous colour's border on selecting a new colour
            if (previousColour != 0) {
                document.getElementById(`${previousColour}`).style["stroke-width"]="0.9px"; 
            }
            previousColour = number;
            currentColour = Colour[number]; // string of colour name e.g. "RED"
        };
    }
    for (var n=1; n<=34; n++) {
        colourPanelListeners(n);
    }

    updateAccPixels();
    // startTime = new Date(); // WAIT need to change this to take into account the "leftover" from the user variables that don't become accumulated pixels
    accumulatePixels();

    // socket.on('grid', function(grid){
    //     bitfieldToImgData(grid);
    //     redraw(myImgData, currentZoom);
    // });
}


function updateAccPixels() {
    console.log(numberOfAccumulatedPixels.getPixels());
    accPixels.innerText = Math.floor(numberOfAccumulatedPixels.getPixels());
}


function accumulatePixels() {
    var increaseAccPixels = setInterval(function() {
        numberOfAccumulatedPixels.addPixels(1);
        updateAccPixels();
    }, cooldownTime*1000); // *1000 to convert to ms
}

function startCountdown() {
    countdownRunning = true;
    var elapsed = new Date() - startTime; // in ms
    var frac = 1 - ((elapsed/1000 % cooldownTime) / cooldownTime); // fraction of cooldownTime left till next accumulated pixels + 1
    var secs = Math.floor(frac * cooldownTime); 
    console.log("Countdown starting with ", frac, secs);
    var mins = Math.floor(secs / 60);
    var secsDisp = secs % 60;
    // setInterval takes one second to start 
    countdownMin.innerText = mins;
    countdownSec.innerText = secsDisp; 
    var interval = setInterval(function() {
        if (secs == 0) {
            clearInterval(interval);
            countdownRunning = false;
        } else {
            secs--;
            mins = Math.floor(secs / 60);
            secsDisp = secs % 60;
            countdownMin.innerText = mins;
            countdownSec.innerText = secsDisp;
        }
    }, 1000);
}


function getStartingIndexForCoord(x, y) {
    return red = y * (CANVAS_WIDTH * 4) + x * 4;
}

function putColour(coods, imgData) {
    // destructively changes imgData but returns a "backup" originalPixel for the pixel it changes
    
    [x, y] = coods;

    var i = getStartingIndexForCoord(x, y);
    
    var originalPixel = {i, r:imgData.data[i], g:imgData.data[i+1], b:imgData.data[i+2], a:imgData.data[i+3]};

    // TODO: use selected colour
    imgData.data[i] = 255;
    imgData.data[i+1] = 0;
    imgData.data[i+2] = 0;
    imgData.data[i+3] = 255;

    return originalPixel;
}

function getCurrentCoods(event) {
    var x = Math.floor(startX + event.offsetX/DISP_TO_CANVAS_SCALE / currentZoom);
    var y = Math.floor(startY + event.offsetY/DISP_TO_CANVAS_SCALE / currentZoom);
    return [x, y];
}


function displayCoods(event) {
    [x, y] = getCurrentCoods(event);
    xCoordDisplay.innerText = (x >= CANVAS_WIDTH || x < 0 ? "out of range" : x + 1);
    yCoordDisplay.innerText = (y >= CANVAS_HEIGHT || y < 0 ? "out of range" : y + 1);
}