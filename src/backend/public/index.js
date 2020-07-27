let socket = io();
let xCoordDisplay = document.getElementById("x");
let yCoordDisplay = document.getElementById("y");
let countdownSec = document.getElementById("countdown-s");
let countdownMin = document.getElementById("countdown-m");
let accPixels = document.getElementById("accPixels");
let canvas = document.getElementById('canvas');
let hammertime = new Hammer(canvas);
hammertime.get('pinch').set({enable: true});

const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)

let cooldownTime = ACCUMULATED_PIXEL_GAP; // in seconds

// these will change with zooming and scrolling around
let currentZoom = 1; // default zoom is 2
let startX = 0; // leftmost mem canvas x-coordinate displayed
let startY = 0; // topmost mem canvas y-coordinate displayed

let numberOfAccumulatedPixels = new accumulatedPixels(0);

let startTime;

let currentColour = "RED"; 

let displayToCanvasScale;

// Resizing Canvas
function scaleCanvas() {
    if (window.matchMedia("(min-width: 768px)").matches) {
        canvas.setAttribute('width', '490');
        canvas.setAttribute('height', '490');
    } else {
        canvas.setAttribute('width', 0.9*vw);
        canvas.setAttribute('height', 0.9*vw);
    }
}
scaleCanvas();
window.addEventListener('resize', scaleCanvas());

function draw() {
    let canvas = document.getElementById('canvas');
    displayToCanvasScale = canvas.clientWidth/128;
    let ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    let memCvs = new OffscreenCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    let memCtx = memCvs.getContext('2d');

    let myImgData = memCtx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT); // might change to global variable

    // API requests
    function httpGetAsync(theUrl, callback) {
        let xmlHttp = new XMLHttpRequest();

        xmlHttp.onload = function() { 
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
                callback(xmlHttp.response);
        }
        xmlHttp.open("GET", theUrl, true);
        xmlHttp.responseType = "json";
        xmlHttp.send(null);
    }

    function bitfieldToImgData(grid) {
        // grid is raw binary data: 4 bits for one pixel, like "0000", so 2 pixels in 1 byte
        // first thing to map to: higher and lower nibbles in each byte
        // map the to 32-bit colours, i.e. r g b a each being one byte 
        // finally 8-bit unsigned int array used by imgData

        // directly changes myImgData variable
        console.log("grid callback reached");
        console.log(grid)
        const gridValue = Object.values(grid.grid);
        // console.log(bitfieldGrid);
        // console.log(String.fromCharCode.apply(null, new Uint8Array(grid)));
        // console.log(Object.values(grid));
        console.log(gridValue);
        // let view = Uint8Array.from(gridValue);
        // console.log(view);
        let rgbaArr = new Uint8ClampedArray(128*128*4);
        for (let i = 0; i < gridValue.length; i++) {
            // iterates over each byte to separate into the two bits
            let num = gridValue[i]; // gives an integer between 0 and 255
            let nibble1 = (num & 0xF0) >> 4; // 0xF0 == '11110000' 
            let nibble2 = num & 0x0F // 0x0F == '00001111'
            let color1 = ColorIndex[nibble1];
            let color2 = ColorIndex[nibble2];
            // console.log(nibble1); // 0111 == 7?
            // console.log(nibble2); // 1011 == 11?
            // console.log(color1);
            // console.log(color2);
            let rgba1 = ColorRGB[color1];
            let rgba2 = ColorRGB[color2];
            // if (num !== 0) {
            //     console.log(num);
            //     console.log(rgba1);
            //     console.log(rgba2);
            // }
            rgbaArr[i*8] = rgba1[0];
            rgbaArr[i*8 + 1] = rgba1[1];
            rgbaArr[i*8 + 2] = rgba1[2];
            rgbaArr[i*8 + 3] = 255;
            rgbaArr[i*8 + 4] = rgba2[0];
            rgbaArr[i*8 + 5] = rgba2[1];
            rgbaArr[i*8 + 6] = rgba2[2];
            rgbaArr[i*8 + 7] = 255;
            // rgbaArr[i*2 + 2] = 255 << 24 | rgba1[2] << 16 | rgba1[1] << 8 | rgba1[0];
            // rgbaArr[i*2 + 1] = 255 << 24 | rgba2[2] << 16 | rgba2[1] << 8 | rgba2[0];
        }

        console.log(rgbaArr);
        myImgData.data.set(rgbaArr);
        redraw(myImgData, currentZoom);
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
        console.log(gap + "ms");
        updateAccPixels();
        
        // TODO: if timestamp was <5 mins of now, need to calculate cooldown timing; if not 5 mins   
        startTime = new Date();
        startTime.setTime(startTime.getTime() - gap % cooldownTime);   
        startCountdown();
        setTimeout(function() {
            numberOfAccumulatedPixels.addPixels(1);
            updateAccPixels();
            accumulatePixels();
            startCountdown();
            console.log(gap % cooldownTime + "ms passed, starting accumulate pixel function");
        }, (cooldownTime - gap % cooldownTime));
        if (numberOfAccumulatedPixels.getPixels() === 0) {
            startCountdown();
        }
    }

    httpGetAsync(`https://tplace.xyz/api/user/${userId}`, initUserVariables);
    httpGetAsync("https://tplace.xyz/api/grid", bitfieldToImgData);
    
    // let rawArr = [255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, ]
    // bitfieldToImgData(rawArr);

    function redraw(imgData, scale) {
        // TODO: I THINK CAN REMOVE THE PARAMETERS CUZ I JUST USE myImgData and currentZoom all the time?
        // clear canvas
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

        // putting grey gridlines on imgData
        // every 10 pixels, if it's a white square, make it grey
        
        // for (let r = 0; r < 128; r++) {
        //     if ((r+1) % 10 === 0) {
        //         // every 10th row
        //         for (let c = 0; c < 128*4; c += 4) {
        //             if (imgData.data[r*128*4 + c] === 255 && imgData.data[r*128*4 + c+1] === 255 && imgData.data[r*128*4 + c+2] === 255) {
        //                 imgData.data[r*128*4 + c] = 211;
        //                 imgData.data[r*128*4 + c+1] = 211;
        //                 imgData.data[r*128*4 + c+2] = 211;
        //                 imgData.data[r*128*4 + c+3] = 255;
        //             }
        //         }
        //     }
        //     for (let c = 36; c < 128*4; c += 40) {
        //         // every 10th column
        //         if (imgData.data[r*128*4 + c] === 255 && imgData.data[r*128*4 + c+1] === 255 && imgData.data[r*128*4 + c+2] === 255) {
        //             imgData.data[r*128*4 + c] = 211;
        //             imgData.data[r*128*4 + c+1] = 211;
        //             imgData.data[r*128*4 + c+2] = 211;
        //             imgData.data[r*128*4 + c+3] = 255;
        //         }
        //     }
        // }
        
        
        // update memCtx with new image data  
        memCtx.putImageData(imgData, 0, 0);
        ctx.drawImage(memCvs, startX, startY, CANVAS_WIDTH/scale, CANVAS_HEIGHT/scale, 0, 0, canvas.clientWidth, canvas.clientHeight);

        // put black border around image
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.strokeRect(-startX*displayToCanvasScale*currentZoom, -startY*displayToCanvasScale*currentZoom, canvas.width*currentZoom, canvas.height*currentZoom);
    }

    // ZOOMING 
    function zoom(delta, absX, absY) {
        // absX and absY are the coordinates where the mouse is at when zooming
        const scaleFactor = 1.1;
        let factor = Math.pow(scaleFactor, delta);

        const previousZoom = currentZoom;
        currentZoom *= factor;
        if (currentZoom < 0.5) {
            currentZoom = 0.5;
            factor = currentZoom / previousZoom;
        } else if (currentZoom > 60) {
            currentZoom = 60;
            factor = currentZoom / previousZoom;
        } 
        startX = absX - (absX-startX)/factor;
        startY = absY - (absY-startY)/factor;
        // console.log(currentZoom, startX, startY, absX, absY);
        
        redraw(myImgData, currentZoom);
    }
    function handleScroll(event) {
        [absX, absY] = getCurrentCoords(event);
        let delta = event.wheelDelta ? event.wheelDelta/40 : event.detail ? -event.detail : 0;
        if (delta) {
            zoom(delta, absX, absY);
            displayCoords(event);
        }
        return event.preventDefault() && false;
    }
    canvas.addEventListener('DOMMouseScroll', handleScroll, false);
    canvas.addEventListener('mousewheel', handleScroll, false);
    canvas.addEventListener('wheel', handleScroll, false);

     // Pinch to Zoom
    let prevPinch = 1,
    pinchChk = false;

    function handlePinch(e) {
        let scale = -((prevPinch-e.scale))*20;
        prevPinch = e.scale;
        zoom(scale, 64, 64);
        pinchChk = true;
    }

    hammertime.on('pinch', handlePinch);

    hammertime.on('pinchstart', function(e) {
        pinchChk = true;
    });

    hammertime.on('pinchend', function(e) {
        window.setTimeout(function(){pinchChk = false}, 50);
        prevPinch = 1;
    })

    // DRAGGING AND CLICKING
    let dragStart, dragged;
    let lastX, lastY;
    let hasSelectedPixel;
    function downDrag(evt) {
        if (pinchChk === true) return;
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        dragStart = {x: lastX, y: lastY};
        dragged = true;
    }
    function moveDrag(evt) {
        if (dragged && pinchChk === false) {
            // console.log('drag');
            const currX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
            const currY = evt.offsetY || (evt.pageY - canvas.offsetTop);
            const deltaX = currX - lastX;
            const deltaY = currY - lastY;
            // updating canvas
            startX -= deltaX/displayToCanvasScale / currentZoom;
            startY -= deltaY/displayToCanvasScale / currentZoom;
            redraw(myImgData, currentZoom);
            // updating lastX and lastY
            lastX = currX;
            lastY = currY;
        }
    }
    function upDrag(evt) {
        const minDelta = 5; // i.e. more than 5 pixels movement consider drag
        const currX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        const currY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        const totalDeltaX = currX - dragStart.x;
        const totalDeltaY = currY - dragStart.y;
        if (Math.abs(totalDeltaX) > minDelta || Math.abs(totalDeltaY) > minDelta) {
            // END DRAG; updating canvas
            // console.log('dragMouseUp');
            if (pinchChk === false) {
                startX -= (currX - lastX)/displayToCanvasScale / currentZoom;
                startY -= (currY - lastY)/displayToCanvasScale / currentZoom;
                redraw(myImgData, currentZoom);
            }            
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
                const [x, y] = getCurrentCoords(evt);
                if (x < 0 || x >= CANVAS_WIDTH || y < 0 || y >= CANVAS_HEIGHT) {
                    // pixel out of range; won't put a colour 
                    let popup = document.getElementById("outofrange-popup");
                    popup.style.left = `${evt.pageX-8}px`;
                    popup.style.top = `${evt.pageY+1}px`;
                    popup.classList.toggle('show');
    
                    let okBtn = document.getElementById("ok2");
                    okBtn.onclick = function(){
                        popup.classList.toggle('show');
                    }
                } else {
                    let originalPixel = putColour([x, y], myImgData); // destructively changes myImgData but returned "backup" of changed pixel
                    redraw(myImgData, currentZoom);        
                    hasSelectedPixel = true;
                    
                    if (Math.floor(numberOfAccumulatedPixels.getPixels()) > 0) {
                        let popup = document.getElementById("confirm-popup");
                        popup.style.left = `${evt.pageX-8}px`;
                        popup.style.top = `${evt.pageY+1}px`;
                        // maybe figure out a way to better set the popup location?
                        popup.classList.toggle('show');

                        let confirmBtn = document.getElementById("confirm");
                        confirmBtn.onclick = function() {
                            confirmColour(x, y, chatId, userId);
                            console.log(x, y);
                            if (Math.floor(numberOfAccumulatedPixels.getPixels()) === 0) {
                                // last accumulated pixel used
                                startCountdown();
                            }
                            hasSelectedPixel = false;
                        }
                        let cancelBtn = document.getElementById("cancel");
                        cancelBtn.onclick = function(){
                            cancelColour(myImgData, originalPixel);
                            popup.classList.toggle('show');
                            hasSelectedPixel = false;
                        };
                    } else { // on cooldown, 0 accumulated pixels
                        let popup = document.getElementById("cooldown-popup");
                        popup.style.left = `${evt.pageX-8}px`;
                        popup.style.top = `${evt.pageY+1}px`;
                        popup.classList.toggle('show');
        
                        let okBtn = document.getElementById("ok");
                        okBtn.onclick = function(){
                            cancelColour(myImgData, originalPixel);
                            popup.classList.toggle('show');
                            hasSelectedPixel = false;
                        }
                    }
                }
            }
        }
    }
    canvas.addEventListener('mousedown', downDrag, false);
    canvas.addEventListener('mousemove', moveDrag, false);
    canvas.addEventListener('mouseup', upDrag, false);
    // canvas.addEventListener('touchstart', downDrag, false);
    // canvas.addEventListener('touchmove', moveDrag, false);
    // canvas.addEventListener('touchend', upDrag, false);

// Convert touch to mouse
function touchHandler(event) {
    let touches = event.changedTouches,
        first = touches[0],
        type = "";
    switch(event.type)
    {
        case "touchstart": type = "mousedown"; break;
        case "touchmove":  type = "mousemove"; break;        
        case "touchend":   type = "mouseup";   break;
        default:           return;
    }

    // initMouseEvent(type, canBubble, cancelable, view, clickCount, 
    //                screenX, screenY, clientX, clientY, ctrlKey, 
    //                altKey, shiftKey, metaKey, button, relatedTarget);

    let simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1, 
                                  first.screenX, first.screenY, 
                                  first.clientX, first.clientY, false, 
                                  false, false, false, 0/*left*/, null);

    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}

canvas.addEventListener("touchstart", touchHandler, true);
canvas.addEventListener("touchmove", touchHandler, true);
canvas.addEventListener("touchend", touchHandler, true);
canvas.addEventListener("touchcancel", touchHandler, true);    

    function confirmColour(x, y, chatId, userId) { 
        console.log("Confirmed colour");
        let cfm_popup = document.getElementById("confirm-popup");
        cfm_popup.classList.toggle('show');
        numberOfAccumulatedPixels.subtractPixels(1);
        updateAccPixels();
        startCountdown();

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
        let now = new Date();
        let r = ColorRGB[currentColour][0];
        let g = ColorRGB[currentColour][1];
        let b = ColorRGB[currentColour][2];
        
        let data = JSON.stringify({ "x": x+1, "y": y+1, "r": r, "g": g, "b": b, "a": 255, "timestamp": now,
            "accPixels": numberOfAccumulatedPixels.getPixels(), "color": ColorBinary[currentColour] });
        console.log(data);
        xhr.send(data); 
    }
    function cancelColour(imgData, originalPixel) {
        console.log("Go back go back go back");
        let i = originalPixel.i;
        imgData.data[i] = originalPixel.r;
        imgData.data[i+1] = originalPixel.g;
        imgData.data[i+2] = originalPixel.b;
        imgData.data[i+3] = originalPixel.a;
        redraw(imgData, currentZoom);
    }

    canvas.addEventListener('mousemove', displayCoords);


    let previousColour = -1;
    function colourPanelListeners(number) {
        let col = document.getElementById(`${number}`);
        col.onclick = function(){ 
            col.style["stroke-width"]="3.5px";
            console.log(number);
            // reset previous colour's border on selecting a new colour
            if (previousColour !== -1) {
                document.getElementById(`${previousColour}`).style["stroke-width"]="2"; 
            }
            previousColour = number;
            currentColour = ColorIndex[number]; // string of colour name e.g. "RED"
            console.log(currentColour + " selected");
        };
    }
    for (let n=0; n<16; n++) {
        colourPanelListeners(n);
    }

    updateAccPixels();
    // startTime = new Date(); // WAIT need to change this to take into account the "leftover" from the user variables that don't become accumulated pixels
    // accumulatePixels();

    // let potato = io({transports: ['websocket'], upgrade: false})
    // let socket = potato.connect();
    socket.on('grid', function(grid){
        console.log(grid)
        try{
            bitfieldToImgData(grid);
            redraw(myImgData, currentZoom);
        } catch (err) {
            console.log(err)
        }
    });
}


function updateAccPixels() {
    console.log(numberOfAccumulatedPixels.getPixels());
    accPixels.innerText = Math.floor(numberOfAccumulatedPixels.getPixels()).toString();
}


function accumulatePixels() {
    let increaseAccPixels = setInterval(function() {
        console.log(new Date()-startTime);
        startTime = new Date();
        numberOfAccumulatedPixels.addPixels(1);
        updateAccPixels();
        startCountdown();
    }, cooldownTime); 
}

function startCountdown() {
    if (numberOfAccumulatedPixels.getPixels() < numberOfAccumulatedPixels.MAX_PIXEL_COUNT) {
        // NOTE: cooldownTime is in MILLISECONDS 
        let elapsed = new Date() - startTime; // in ms
        let frac = 1 - ((elapsed % cooldownTime) / cooldownTime); // fraction of cooldownTime left till next accumulated pixels + 1
        let secs = Math.floor(frac * cooldownTime/1000); 
        console.log("Elapsed timing: " + elapsed + "\n Countdown starting with ", frac, secs);
        let mins = Math.floor(secs / 60);
        let secsDisp = secs % 60;
        // setInterval takes one second to start 
        countdownMin.innerText = mins;
        countdownSec.innerText = secsDisp; 
        let interval = setInterval(function() {
            if (secs === 0) {
                clearInterval(interval);
            } else {
                secs--;
                mins = Math.floor(secs / 60);
                secsDisp = secs % 60;
                countdownMin.innerText = mins;
                countdownSec.innerText = secsDisp;
            }
        }, 1000);
    }   
}


function getStartingIndexForCoord(x, y) {
    return y * (CANVAS_WIDTH * 4) + x * 4;
}

function putColour(coords, imgData) {
    // destructively changes imgData but returns a "backup" originalPixel for the pixel it changes
    
    [x, y] = coords;

    const i = getStartingIndexForCoord(x, y);
    
    const originalPixel = {i, r:imgData.data[i], g:imgData.data[i+1], b:imgData.data[i+2], a:imgData.data[i+3]};

    const rgb = ColorRGB[currentColour];
    imgData.data[i] = rgb[0];
    imgData.data[i+1] = rgb[1];
    imgData.data[i+2] = rgb[2];
    imgData.data[i+3] = 255;

    return originalPixel;
}

function getCurrentCoords(event) {
    let x = Math.floor(startX + event.offsetX/displayToCanvasScale / currentZoom);
    let y = Math.floor(startY + event.offsetY/displayToCanvasScale / currentZoom);
    return [x, y];
}


function displayCoords(event) {
    [x, y] = getCurrentCoords(event);
    xCoordDisplay.innerText = (x >= CANVAS_WIDTH || x < 0 ? "out of range" : x + 1);
    yCoordDisplay.innerText = (y >= CANVAS_HEIGHT || y < 0 ? "out of range" : y + 1);
}