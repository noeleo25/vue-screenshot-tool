const ScreenshotComponent = {
    template:
    `<div class="wrapper" id="demo-wrapper">
        
        <button id="magnifier" type="button" class="demo-btn btn btn-primary" @click="initMagnifier()"> Magnifier </button>
        <div id="screenshot-area">

            <div @mousemove="move" @mousedown="startSelection" @mouseup="finishSelection"
            class="screenshot-area_container d-flex flex-column justify-content-center"> 
                <div v-show="isMagnifierInit"  @mousemove="move" id="magnify-scope" class="_magnify_scope">
                    <div id="_bottom_layer" tabindex="0" :style="magnifierStyle">
                        <div id="magnified-img" :style="magnifierImgStyle"> </div>
                    </div>  
                </div>
                <h3 class="align-self-center"></h3>
                <div class="align-self-center">
                <button id="save-demo-btn" class="demo-element demo-btn btn btn-primary btn-lg" :class="{ 'hidden' : !screenshotToCanvas }" @click="saveScreenshot"> Save Screenshot </button>
                <button id="start-demo-btn" class="demo-element demo-btn btn btn-light btn-lg" :class="{ 'hidden' : !screenshotToCanvas }" @click="restartDemo"> Try again! </button>
                </div>
            
                <div class="demo-element demo-overlay" :class="{ 'hidden' : isStarting || isFinished || finishedScreenshot, 'highlight' : isMouseDown }" :style="{ borderWidth: borderWidth }"></div>
                <div class="demo-element demo-crosshairs" :class="{ 'hidden' : isMouseDragging || finishedScreenshot || hideCrossHairs }"  :style="{ left: crossHairX + 'px', top: crossHairY + 'px' }"></div>
                
                <div id="sc-box" class="demo-element demo-borderedBox" :class="{ 'hidden' : isStarting || finishedScreenshot, 'save-transition' : isFinished }" :style="{ left: selectedAreaLeft + 'px', top: selectedAreaTop + 'px', width: selectedAreaW + 'px', height: selectedAreaH + 'px' }">
                <transition name="flash">
                    <div v-if="isFinished" class="flash-area"></div>
                </transition>
                </div>

                <span id="demo-tooltip" class="demo-element demo-tooltip" :class="{ 'hidden': !isMouseDragging }" :style="{ left: tooltipLeft + 'px', top: tooltipTop + 'px'}">w: {{selectedAreaW}}, h: {{selectedAreaH}}</span>
            </div>
        </div>

    </div> 
    `,
    data: function () {
        return {
            srcLg : "/assets/rickAndMorty.jpg",
            srcSh : "/assets/rickAndMorty.jpg",
            crossHairX: 0,
            crossHairY: 0,
            isMouseDown: false,
            startX: 0,
            startY: 0,
            isMouseDragging: false, 
            tookScreenShot: false,
            borderWidth: "",
            isStarting: true, //about Selected area
            isFinished: false, //about Selected area
            finishedScreenshot: false, //about screenshot
            screenshotToCanvas: false,
            savedScreenshot: false, //after copy to canvas and convert to dataURL

            //Selected area
            selectedAreaTop: 0,
            selectedAreaLeft: 0,
            selectedAreaW: 0,
            selectedAreaH: 0,

            //Tooltip
            tooltipLeft: 0,
            tooltipTop: 0,
            tooltipW: 0,
            tooltipH: 0,
            
            winWidth: 0, 
            winHeight: 0,

            imageUrl: '',
            sx: 0, //x-axis coord of the top left corner (selected area)
            sy: 0,  //y-axis coord of the top left corner (selected area)

            isMagnifierInit: false,
            hideCrossHairs: false,
            magnifierImgUrl: '',
            //magnifierEl: null,
            magnifierConfig: {
                zoom: 2,
                diameter: 110,
                radius: 50,
            },
            magnifierStyle: {
               
                borderRadius: '100%',
                top: '0',
                left: '0',
            },
            magnifierImgStyle: {
                backgroundImage: 'none',
                backgroundPosition: '0',
                imageRendering: 'auto',
                transform: 'scale(1)',
                backgroundSize: 'auto',
                backgroundRepeat: 'no-repeat',
            }
        }
    },

    mounted: function () {
        this.winWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        this.winHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        
        // Recalculate width and height if viewport size changes.
        var self = this;
        window.onresize = function () {
          self.windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
          self.windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        }; 
    },
    computed: {
    },
    methods: {
        initMagnifier(){
            this.isMagnifierInit = true;
            this.hideCrossHairs = true;
            this.captureVisibleArea()
            this.setMagnifier();
        },
        setMagnifier(){
            let magnifier = document.getElementById("_bottom_layer");
            magnifier.style.imageRendering = "auto";
            magnifier.style.borderRadius = this.magnifierConfig + "%";
            magnifier.style.width = this.magnifierConfig.diameter + "px";
            magnifier.style.height = this.magnifierConfig.diameter + "px";
            magnifier.style.boxShadow = "0 0 0 " + 7/2 + "px rgba(255, 255, 255, 0.85), " +
                                        "0 0 " + 7/2 + "px " + 7/2 + "px rgba(0, 0, 0, 0.25), " +
                                        "inset 0 0 " + 40/2 + "px "+ 2/2 + "px rgba(0, 0, 0, 0.25)";
            this.magnifierImgStyle.transform = "scale(" + this.magnifierConfig.zoom + ")";

        },
        captureVisibleArea(){
            html2canvas(document.querySelector('body')).
            then(canvas => {
                let croppedCanvas = document.createElement('canvas'),
                croppedCanvasContext = croppedCanvas.getContext('2d');

                croppedCanvas.width = document.body.clientWidth;
                croppedCanvas.height = document.body.clientHeight;

                croppedCanvasContext.drawImage(canvas, 
                    0, 0, document.body.clientWidth, document.body.clientHeight,
                    0, 0, document.body.clientWidth, document.body.clientHeight);

                return croppedCanvas;
            }).then(canvas => {
                this.magnifierImgUrl = canvas.toDataURL("image/png", 1.0).replace("image/png", "image/octet-stream");
                this.applyMagnifier();
            })
        },
        applyMagnifier(){
            if(this.magnifierImgUrl != ''){
                this.magnifierImgStyle.backgroundImage = 'url('+this.magnifierImgUrl+')';
                this.moveMagnifier();
            }
        },
        moveMagnifier(){
            this.magnifierStyle.top = (this.crossHairY - (this.magnifierConfig.diameter/2) ) + 'px';
            this.magnifierStyle.left = (this.crossHairX - (this.magnifierConfig.diameter/2) ) + 'px';
            let offsetX =(this.crossHairX)*(-1); //- (this.magnifierConfig.diameter/2);
            let offsetY = (this.crossHairY)*(-1); //- (this.magnifierConfig.diameter/2);
            this.magnifierImgStyle.backgroundPosition = (offsetX + this.magnifierConfig.diameter/2) + 'px ' 
                                                        + (offsetY + this.magnifierConfig.diameter/2) + 'px';
            //let magnifierScopeSize = document.getElementById('magnify-scope');
            //this.magnifierStyle.backgroundSize = (magnifierScopeSize.clientWidth * this.magnifierConfig.zoom) + 'px';
        },
        move: function(e) {
            if(!this.finishedScreenshot){
                this.finishedScreenshot = false
                this.crossHairX = e.clientX;
                this.crossHairY = e.clientY;
                let tooltip = document.getElementById('demo-tooltip');
                if(tooltip){
                    this.tooltipW = tooltip.clientWidth;
                    this.tooltipH = tooltip.clientHeight;
                }

                if(this.isMouseDown){
                    var startX  =   this.startX, 
                    startY      =   this.startY,
                    currentX        =   e.clientX, //cropping end in last coordinates
                    currentY        =   e.clientY,
                    winWidth    =   window.innerWidth,
                    winHeight   =   window.innerHeight

                    //Current values are different from starting values: is dragging
                    if (currentX >= startX && currentY >= startY) //right-down OK
                    {
                        this.isMouseDragging = true;
                        document.body.style.cursor = 'crosshair';
                        this.borderWidth = startY + "px " 
                                        + (winWidth - currentX) + "px " 
                                        + (winHeight - currentY) + "px " 
                                        + startX + "px";

                        this.selectedAreaTop = startY;
                        this.selectedAreaLeft = startX;
                        this.selectedAreaW = currentX - startX;
                        this.selectedAreaH = currentY - startY;

                        this.tooltipLeft = currentX;
                        this.tooltipTop = currentY;
                        this.sx = startX;
                        this.sy = startY;
                    }else if(currentX <= startX && currentY >= startY) //left-down OK
                    {
                        this.isMouseDragging = true;
                        document.body.style.cursor = 'crosshair';
                        this.borderWidth = startY + "px " 
                                        + (winWidth - startX) + "px " 
                                        + (winHeight - currentY) + "px " 
                                        + currentX + "px";
                        
                        this.selectedAreaLeft = currentX;
                        this.selectedAreaTop = startY;
                        this.selectedAreaW = startX - currentX;
                        this.selectedAreaH = currentY - startY;
                        
                        this.tooltipLeft = currentX - this.tooltipW;
                        this.tooltipTop = currentY;
                        this.sx = currentX;
                        this.sy = currentY - this.selectedAreaH;
                    }else if(currentX >= startX && currentY <= startY) //right-top OK
                    {
                        this.isMouseDragging = true;
                        document.body.style.cursor = 'crosshair';
                        this.borderWidth = currentY + "px " 
                                        + (winWidth - currentX) + "px " 
                                        + (winHeight - startY) + "px " 
                                        + startX + "px";
            
                        this.selectedAreaLeft = startX;
                        this.selectedAreaTop = currentY;
                        this.selectedAreaW = currentX - startX;
                        this.selectedAreaH = startY - currentY;
                        
                        this.tooltipLeft = currentX;
                        this.tooltipTop = currentY - this.tooltipH;
                        this.sx = startX;
                        this.sy = startY - this.selectedAreaH;
                    }else if(currentX <= startX && currentY <= startY) //left-top OK
                    {
                        this.isMouseDragging = true;
                        document.body.style.cursor = 'crosshair';
                        this.borderWidth = currentY + "px " 
                                        + (winWidth - startX) + "px " 
                                        + (winHeight - startY) + "px " 
                                        + currentX + "px";
                        
                        this.selectedAreaLeft = currentX;
                        this.selectedAreaTop = currentY;
                        this.selectedAreaW = startX - currentX;
                        this.selectedAreaH = startY - currentY;
                        
                        this.tooltipLeft = currentX - this.tooltipW;
                        this.tooltipTop = currentY - this.tooltipH;
                        this.sx = currentX;
                        this.sy = currentY;
                    }else{
                        this.isMouseDragging = false;
                    }
                }else{
                    if(this.isMagnifierInit){
                        this.moveMagnifier();
                    }
                }
            }
        },
        startSelection: function(e){
            this.borderWidth = this.windowWidth + "px " + this.windowHeight + "px"; 
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.isMouseDown = true;
            this.isStarting = false;
            this.isFinished = false;
            this.tookScreenShot = false;
        },

        finishSelection: function(e){
            this.isFinished = true;
            this.borderWidth = 0;
            //validate selected area size
            if(this.isMouseDragging && this.selectedAreaH > 10 && this.selectedAreaW > 10){
                this.tookScreenShot = true;
                let self = this;
                setTimeout(function(){ 
                    self.finishedScreenshot = true;
                    self.takeScreenshot();
                }, 500);
            }
            this.isMouseDown = false;
            this.isMouseDragging = false;
            document.body.style.cursor = 'default';
        },

        takeScreenshot: function(){
            this.screenshotSound();

            html2canvas(document.querySelector('body')).
            then(canvas => {
                let croppedCanvas = document.createElement('canvas'),
                croppedCanvasContext = croppedCanvas.getContext('2d');

                croppedCanvas.width = this.selectedAreaW;
                croppedCanvas.height = this.selectedAreaH;

                croppedCanvasContext.drawImage(canvas, 
                    this.sx, this.sy, this.selectedAreaW, this.selectedAreaH,
                    0, 0, this.selectedAreaW, this.selectedAreaH);

                this.imageUrl = croppedCanvas.toDataURL("image/png", 1.0).replace("image/png", "image/octet-stream");
                this.screenshotToCanvas = true;
            })
        },

        screenshotSound: function(){
            this.sound = document.createElement("audio");
            this.sound.src = '../assets/sound.wav';
            this.sound.setAttribute("preload", "auto");
            this.sound.setAttribute("controls", "none");
            this.sound.style.display = "none";
            document.body.appendChild(this.sound);
            this.sound.play();
        },

        saveScreenshot: function(){
            var link = document.createElement('a');
            link.download = "screenshot.png";
            link.href = this.imageUrl;
            link.click();

            this.savedScreenshot = true;
        },

        restartDemo: function(){
            //activate move again
            this.finishedScreenshot = false;
            this.imageUrl = '';
            this.sx = 0;
            this.sy = 0;
            this.isStarting = true; //to restart selection tool
            this.isFinished = false; // "  "  "
            this.tookScreenShot = false;
            this.savedScreenshot = false;
            this.screenshotToCanvas = false;
            this.askUserToLogin = false;
            this.hideCrossHairs = false;
        }
    }
};