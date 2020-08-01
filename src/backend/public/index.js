let socket = io({ transport : ['websocket'] });
let xCoordDisplay = document.getElementById("x");
let yCoordDisplay = document.getElementById("y");
let countdownSec = document.getElementById("countdown-s");
let countdownMin = document.getElementById("countdown-m");
let accPixels = document.getElementById("accPixels");
let canvas = document.getElementById('canvas');
let maxAccPixelCount = document.getElementById('maxAccPixelCount').innerHTML = MAXIMUM_ACCUMULATED_PIXEL_COUNT;
let hammertime = new Hammer(canvas);
hammertime.get('pinch').set({enable: true});

let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)

let cooldownTime = COOLDOWN_TIME; // in seconds

// these will change with zooming and scrolling around
let currentZoom = 1; // default zoom is 2
let startX = 0; // leftmost mem canvas x-coordinate displayed
let startY = 0; // topmost mem canvas y-coordinate displayed

let numberOfAccumulatedPixels = new accumulatedPixels(0);

let startTime;
let oldLastUpdatedTime;
let newLastUpdatedTime;

let currentColour = "RED"; 

let displayToCanvasScale;
let currentDisplay;

let clicked = false;

// Resizing Canvas
function scaleCanvas() {
    if (window.matchMedia("(min-width: 768px)").matches) {
        canvas.setAttribute('width', '490');
        canvas.setAttribute('height', '490');
        currentDisplay = "Desktop";
    } else {
        canvas.setAttribute('width', (0.9 * vw).toString());
        canvas.setAttribute('height', (0.9 * vw).toString());
        currentDisplay = "Mobile";
    }
    console.log(currentDisplay);
}
scaleCanvas();

// Refresh page if canvas is changed between Mobile and Desktop size
function resizeCanvas() {
    if (window.matchMedia("(min-width: 768px)").matches) {
        if (currentDisplay !== "Desktop") location.reload();
    } else {
        location.reload();
    }
}

window.addEventListener('resize', resizeCanvas);

function draw() {
    let canvas = document.getElementById('canvas');
    displayToCanvasScale = canvas.clientWidth/128;
    let ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    let memCvs = document.createElement('canvas');
    memCvs.width = CANVAS_WIDTH;
    memCvs.height = CANVAS_HEIGHT;
    // let memCvs = new OffscreenCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    let memCtx = memCvs.getContext('2d');

    let myImgData = memCtx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT); // might change to global variable

    // API requests
    function httpGetAsync(theUrl, callback) {
        let xmlHttp = new XMLHttpRequest();

        xmlHttp.onload = function() { 
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                callback(xmlHttp.response);
            }
        }

        console.log("Url: " + theUrl);
        console.log("Callback: " + callback.toString());

        xmlHttp.open("GET", theUrl, true);
        xmlHttp.responseType = "json";
        xmlHttp.send(null);
    }

    function bitfieldToImgData(grid) {
        // grid is raw binary data: 4 bits for one pixel, like "0000", so 2 pixels in 1 byte
        // first map to: higher and lower nibbles in each byte
        // then map to: 8-bit unsigned int array used by imgData, r g b a each being one byte 

        const gridValue = Object.values(grid.grid);
        let rgbaArr = new Uint8ClampedArray(128*128*4);
        for (let i = 0; i < gridValue.length; i++) {
            // iterates over each byte to separate into the two bits
            const num = gridValue[i]; // gives an integer between 0 and 255
            const nibble1 = (num & 0xF0) >> 4; // 0xF0 == '11110000'
            const nibble2 = num & 0x0F // 0x0F == '00001111'
            const color1 = ColorIndex[nibble1];
            const color2 = ColorIndex[nibble2];
            const rgba1 = ColorRGB[color1];
            const rgba2 = ColorRGB[color2];

            rgbaArr[i*8] = rgba1[0];
            rgbaArr[i*8 + 1] = rgba1[1];
            rgbaArr[i*8 + 2] = rgba1[2];
            rgbaArr[i*8 + 3] = 255;
            rgbaArr[i*8 + 4] = rgba2[0];
            rgbaArr[i*8 + 5] = rgba2[1];
            rgbaArr[i*8 + 6] = rgba2[2];
            rgbaArr[i*8 + 7] = 255;
        }

        myImgData.data.set(rgbaArr);
        redraw(myImgData, currentZoom);
    }

    const userUrl = window.location.href.split("/"); 
    const userId = userUrl[userUrl.length - 1];
    let chatId;

    function initUserVariables(userVariables) {
        console.log(userVariables);
        chatId = userVariables["group_id"];
        oldLastUpdatedTime = userVariables["last_updated"];

        numberOfAccumulatedPixels.setPixels(userVariables["accumulated_pixels"]);
        const lastUpdated = new Date(userVariables["last_updated"]);
        const gap = new Date() - lastUpdated; // in ms
        numberOfAccumulatedPixels.addPixels(Math.floor(gap / COOLDOWN_TIME));
        console.log("initialised number of pixels: ");
        console.log(gap + "ms");
        updateAccPixels();
        
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
    
    function redraw(imgData, scale) {
        // TODO: I THINK CAN REMOVE THE PARAMETERS CUZ I JUST USE myImgData and currentZoom all the time?
        // clear canvas
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        
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
        
        redraw(myImgData, currentZoom);
    }
    function handleScroll(event) {
        [absX, absY] = getCurrentCoords(event);
        console.log(`X: ${event.offsetX}, Y: ${event.offsetY}`);
        let delta = event.wheelDelta ? event.wheelDelta/40 : event.deltaY ? -event.deltaY : 0;
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
        event = {offsetX: canvas.clientWidth/2, offsetY: canvas.clientWidth/2};
        [absX, absY] = getCurrentCoords(event);
        zoom(scale, absX, absY);
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
    let hasSelectedPixel = false;
    let originalPixel = 0;
    let touchPoints = 0;

    function downDrag(evt) {
        if (pinchChk || evt.button !== 0) return;
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        dragStart = {x: lastX, y: lastY};
        dragged = true;
        touchPoints++;
        // console.log(touchPoints);
    }
    function moveDrag(evt) {
        if (dragged && !pinchChk && touchPoints < 2) {
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

        // Hover Pixels (not on touch interfaces)
        if (!evt.metaKey) {
            if (originalPixel && !hasSelectedPixel) {
                cancelColour(myImgData, originalPixel);
            }
            var [x, y] = getCurrentCoords(evt);
            if (!(x < 0 || x >= CANVAS_WIDTH || y < 0 || y >= CANVAS_HEIGHT)) {
                if (!hasSelectedPixel) {
                    originalPixel = putColour([x, y], myImgData); // destructively changes myImgData but returned "backup" of changed pixel
                    redraw(myImgData, currentZoom);  
                }
            }
        }
    }

    function leaveCanvas(evt) {
        // when mouse leaves canvas
        const minDelta = 5; // i.e. more than 5 pixels movement consider drag
        const currX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        const currY = evt.offsetY || (evt.pageY - canvas.offsetTop);

        if (originalPixel && !hasSelectedPixel) {
            cancelColour(myImgData, originalPixel);
        }
        if (dragged) {
            const totalDeltaX = currX - dragStart.x;
            const totalDeltaY = currY - dragStart.y;
            if (Math.abs(totalDeltaX) > minDelta || Math.abs(totalDeltaY) > minDelta) {
                // END DRAG; updating canvas
                if (!pinchChk && touchPoints === 1) {
                    startX -= (currX - lastX)/displayToCanvasScale / currentZoom;
                    startY -= (currY - lastY)/displayToCanvasScale / currentZoom;
                    redraw(myImgData, currentZoom);
                }            
                dragStart = null;
            }
            dragged = false;
        }
        if (touchPoints !== 0) touchPoints = 0;
    }

    function upDrag(evt) {
        const minDelta = 5; // i.e. more than 5 pixels movement consider drag
        const currX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        const currY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        if (dragged) {
            const totalDeltaX = currX - dragStart.x;
            const totalDeltaY = currY - dragStart.y;
            if (Math.abs(totalDeltaX) > minDelta || Math.abs(totalDeltaY) > minDelta) {
                // END DRAG; updating canvas
                // console.log('dragMouseUp');
                if (pinchChk === false && touchPoints < 2) {
                    startX -= (currX - lastX)/displayToCanvasScale / currentZoom;
                    startY -= (currY - lastY)/displayToCanvasScale / currentZoom;
                    redraw(myImgData, currentZoom);
                }            
                dragStart = null;
            } else if (evt.button === 0 && touchPoints < 2) {
                // CLICK    
                if (hasSelectedPixel) {
                    // if there's already a selected pixel, other clicks will be ignored
                    console.log("there is already a selected pixel");
                } else {
                    clicked = true;
                    const [x, y] = getCurrentCoords(evt);
                    if (x < 0 || x >= CANVAS_WIDTH || y < 0 || y >= CANVAS_HEIGHT) {
                        // pixel out of range
                        let popup = document.getElementById("outofrange-popup");
                        popup.style.left = `${evt.pageX-8}px`;
                        popup.style.top = `${evt.pageY+1}px`;
                        popup.classList.toggle('show');
        
                        let okBtn = document.getElementById("ok2");
                        okBtn.onclick = function(){
                            popup.classList.toggle('show');
                            clicked = false;
                        }
                    } else {
                        if (originalPixel) cancelColour(myImgData, originalPixel);
                        originalPixel = putColour([x, y], myImgData); // destructively changes myImgData but returned "backup" of changed pixel
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
                                    // last accumulated pixel just used
                                    startCountdown();
                                }
                                clicked = false;
                                hasSelectedPixel = false;
                                originalPixel = null;
                            }
                            let cancelBtn = document.getElementById("cancel");
                            cancelBtn.onclick = function(){
                                cancelColour(myImgData, originalPixel);
                                popup.classList.toggle('show');
                                hasSelectedPixel = false;
                                clicked = false;
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
                                clicked = false;
                            }
                        }
                    }
                }
            } else {
                if (originalPixel) cancelColour(myImgData, originalPixel);
            }
        }
        touchPoints = 0;
        // console.log(touchPoints);
        dragged = false;
    }
    canvas.addEventListener('mousedown', downDrag, false);
    canvas.addEventListener('mousemove', moveDrag, false);
    canvas.addEventListener('mouseup', upDrag, false);
    canvas.addEventListener('mouseleave', leaveCanvas, false);

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
                                    false, false, true, 0/*left*/, null);

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

        let newLastUpdatedTime = new Date();
        let data = JSON.stringify({ "x": x+1, "y": y+1, "oldLastUpdatedTime": oldLastUpdatedTime,
            "newLastUpdatedTime": newLastUpdatedTime, "accPixels": numberOfAccumulatedPixels.getPixels(),
            "color": ColorBinary[currentColour] });
        oldLastUpdatedTime = newLastUpdatedTime
        console.log(data);
        xhr.onreadystatechange = function () {
            // In local files, status is 0 upon success in Mozilla Firefox
            if(xhr.readyState === XMLHttpRequest.DONE) {
                const status = xhr.status;
                if (status === 403) {
                    let popup = document.getElementById("userconflict-popup");
                    popup.classList.toggle('show');
                    let okBtn = document.getElementById("ok3");
                    okBtn.onclick = function() {
                        popup.classList.toggle('show');
                    }
                }
            }
        };
        xhr.send(data);
    }
    function cancelColour(imgData, originalPixel) {
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
        let frac = 1 - ((elapsed % cooldownTime) / cooldownTime); // fraction of cooldownTime left till next pixel
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
    
    originalPixel = {i, r:imgData.data[i], g:imgData.data[i+1], b:imgData.data[i+2], a:imgData.data[i+3]};

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
    if (!clicked) {
        [x, y] = getCurrentCoords(event);
        xCoordDisplay.innerText = (x >= CANVAS_WIDTH || x < 0 ? "NA" : x + 1);
        yCoordDisplay.innerText = (y >= CANVAS_HEIGHT || y < 0 ? "NA" : y + 1);
    }
}