const MagnifierComponent = {
    template:
    `
    <div v-show="isInit" id="magnify-scope" class="_magnify_scope">
        <div id="_bottom_layer" tabindex="0" :style="magnifierStyle">
            <div id="magnified-img" :style="magnifierImgStyle"> </div>
        </div>  
    </div>
    `,
    data: function () {
        return {
            magnifierImgUrl: '',
            magnifierConfig: {
                zoom: 2,
                diameter: 110,
                radius: 50,
                selector: 'body', //where the magnifier will be applied
            },
            magnifierStyle: {
                borderRadius: '100%',
                top: '0',
                left: '0',
                visibility: 'visible',
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
    props:{
        isInit: {
            type: Boolean,
            
        },
        pointerX: {
            type: Number,
            
        },
        pointerY: {
            type: Number,
            
        }
    },
    mounted(){
        if(this.isInit){
            this.initMagnifier();
        }else{
            this.disableMagnifier();
        }
    },
    watch: {
        isInit(val){
            if(val){
                this.initMagnifier();
            }
        },
        pointerX: function(){
            this.moveMagnifier();
        },
        pointerY: function(){
            this.moveMagnifier();
        }
    },
    methods: {
        initMagnifier(){
            this.captureVisibleArea()
            this.setMagnifier();
        },
        disableMagnifier(){
            this.magnifierStyle.visibility = 'hidden';
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
            this.magnifierStyle.visibility = 'visible';

        },
        captureVisibleArea(){
            html2canvas(document.querySelector(this.magnifierConfig.selector)).
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
            if(this.isInit){
                this.magnifierStyle.top = (this.pointerY - (this.magnifierConfig.diameter/2) ) + 'px';
                this.magnifierStyle.left = (this.pointerX - (this.magnifierConfig.diameter/2) ) + 'px';
                let offsetX = (this.pointerX)*(-1);
                let offsetY = (this.pointerY)*(-1);
                this.magnifierImgStyle.backgroundPosition = (offsetX + this.magnifierConfig.diameter/2) + 'px ' 
                                                            + (offsetY + this.magnifierConfig.diameter/2) + 'px';
            }
        },
    }
};