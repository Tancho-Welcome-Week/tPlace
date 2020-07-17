let xCoordDisplay = document.getElementById("x");
let yCoordDisplay = document.getElementById("y");
let countdown = document.getElementById("countdown");

let countdownRunning = false;

// these will change with zooming and scrolling around
let currentZoom = 1; 
let startX = 0; // leftmost canvas x-coordinate displayed
let startY = 0; // topmost canvas y-coordinate displayed

function draw() {
    // for the actual image data
    CANVAS_HEIGHT = 200;
    CANVAS_WIDTH = 300;

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    var memCvs = new OffscreenCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    var memCtx = memCvs.getContext('2d');

    // REFACTOR TO API REQUEST TO DO DRAWING GRID STUFF
    
    var rawArr = [255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, ]
    var myImgData = memCtx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
    for (i = 0; i < 100; i += 4) {
        myImgData.data[i] = rawArr[i];
        myImgData.data[i+1] = rawArr[i+1];
        myImgData.data[i+2] = rawArr[i+2];
        myImgData.data[i+3] = rawArr[i+3];
    }

    function redraw(imgData, scale) {
        // clear canvas
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

        // update memCtx with new image data  
        memCtx.putImageData(imgData, 0, 0);

        ctx.drawImage(memCvs, startX, startY, CANVAS_WIDTH/scale, CANVAS_HEIGHT/scale, 0, 0, canvas.clientWidth, canvas.clientHeight);
        // ctx.translate(-startX, -startY);
        // ctx.scale(scale, scale);
        // ctx.drawImage(memCvs, 0, 0, scale*CANVAS_WIDTH, scale*CANVAS_HEIGHT); 
    }
    redraw(myImgData, 1); 


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
        var absX = startX + event.offsetX/2 / currentZoom;
        var absY = startY + event.offsetY/2 / currentZoom;
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
    canvas.addEventListener('mousedown', function(evt) {
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        dragStart = {x: lastX, y: lastY};
        dragged = true;
    },false);
    canvas.addEventListener('mousemove', function(evt) {
        if (dragged) {
            console.log('drag');
            currX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
            currY = evt.offsetY || (evt.pageY - canvas.offsetTop);
            deltaX = currX - lastX;
            deltaY = currY - lastY;
            // updating canvas
            startX -= deltaX/2 / currentZoom;
            startY -= deltaY/2 / currentZoom;
            redraw(myImgData, currentZoom);
            // updating lastX and lastY
            lastX = currX;
            lastY = currY;
        }
    },false);
    canvas.addEventListener('mouseup', function(evt) {
        minDelta = 5; // i.e. more than 5 pixels movement consider drag
        currX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        currY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        totalDeltaX = currX - dragStart.x;
        totalDeltaY = currY - dragStart.y;
        if (Math.abs(totalDeltaX) > minDelta || Math.abs(totalDeltaY) > minDelta) {
            // end drag; updating canvas
            console.log('dragMouseUp');
            startX -= (currX - lastX)/2 / currentZoom;
            startY -= (currY - lastY)/2 / currentZoom;
            redraw(myImgData, currentZoom);
            dragStart = null;
            dragged = false;
        } else {
            // click
            console.log('click');
            dragged = false;

            var originalPixel = putColour(event, myImgData); // destructively changed myImgData but returned "backup" of changed pixel
            redraw(myImgData, currentZoom);
            if (hasSelectedPixel) {
                cancelColour(myImgData, originalPixel); 
            } else {
                hasSelectedPixel = true;
                if (!countdownRunning) {
                    var popup = document.getElementById("confirm-popup");
                    popup.style.left = `${evt.pageX-8}px`;
                    popup.style.top = `${evt.pageY+1}px`;
                    popup.classList.toggle('show');
    
                    var confirmBtn = document.getElementById("confirm");
                    confirmBtn.onclick = function(){
                        confirmColour();
                        startCountdown();
                        hasSelectedPixel = false;
                    }
                    var cancelBtn = document.getElementById("cancel");
                    cancelBtn.onclick = function(){
                        cancelColour(myImgData, originalPixel);
                        popup.classList.toggle('show');
                        hasSelectedPixel = false;
                    };
                } else {
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
    },false);

    function confirmColour() { 
        console.log("Confirmed colour");
        var cfm_popup = document.getElementById("confirm-popup");
        cfm_popup.classList.toggle('show');
        // TODO: SOCKET STUFF
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
            // reset on selecting the next colour
            if (previousColour != 0) document.getElementById(`${previousColour}`).style["stroke-width"]="0.9px"; 
            previousColour = number;
        };
    }
    for (var n=1; n<=34; n++) {
        colourPanelListeners(n);
    }
}


function getStartingIndexForCoord(x, y) {
    return red = y * (CANVAS_WIDTH * 4) + x * 4;
}


function startCountdown() {
    console.log(countdownRunning);
    countdownRunning = true;
    var t = 5;
    countdown.innerText = t; // because the setInterval function waits one second before starting
    var interval = setInterval(function() {
        t--;
        countdown.innerText = t;
        if (t == 0) {
            clearInterval(interval);
            countdownRunning = false;
        }
    }, 1000);
}


function putColour(event, imgData) {
    // destructively changes imgData but returns a "backup" originalPixel for the pixel it changes
    var x = Math.floor(startX + event.offsetX/2 / currentZoom);
    var y = Math.floor(startY + event.offsetY/2 / currentZoom);

    console.log(x, y);

    var i = getStartingIndexForCoord(x, y);
    
    var originalPixel = {i, r:imgData.data[i], g:imgData.data[i+1], b:imgData.data[i+2], a:imgData.data[i+3]};

    // TODO: use selected colour
    imgData.data[i] = 255;
    imgData.data[i+1] = 0;
    imgData.data[i+2] = 0;
    imgData.data[i+3] = 255;

    return originalPixel;
}


function displayCoods(event) {
    var x = Math.floor(startX + event.offsetX/2 / currentZoom);
    var y = Math.floor(startY + event.offsetY/2 / currentZoom);
    xCoordDisplay.innerText = "x: " + x;
    yCoordDisplay.innerText = "y: " + y;
}