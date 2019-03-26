(function(window){
    // redefine windows requestAnimFrame
    window.requestAnimFrame = (function() {
        
        return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function( 
            /* function FrameRequestCallback */ 
            callback,
            /* fps, default 60*/
            frameNumber = 60,
            /* DOMElement Element */
            element) {
            return window.setTimeout(callback, 1000 / frameNumber);
        };
    })();


    


    window.tree = function(selector){
        const canvas = document.querySelector(selector);
        const ctx = canvas.getContext('2d');
        const frameNumber = 60;//fps

        let options = {
            pen:{
                color:'yello',
                outline:'green'
            },
            data:[
                // {
                //     angle:'90',    //和垂直方向的角度
                //     length:'100',     //长度
                //     color:'#00ff00',      //颜色
                //     type:'circle',       //类型
                //     text:'this is name',       //文本信息
                //     img:null         //图片
                // }
            ],
            step:20,
            minSpace:30,
            maxSpace:150
        };

        const init = function({...otherOptions}){
    
            console.log('otherOptions',otherOptions);
            otherOptions = otherOptions === undefined?options:otherOptions;
            options.pen = otherOptions.pen ==undefined ?options.pen:otherOptions.pen;
            options.data = otherOptions.data ==undefined ?options.data:otherOptions.data;
            options.step = otherOptions.step ==undefined ?options.step:otherOptions.step;
            options.minSpace = otherOptions.minSpace ==undefined ?options.minSpace:otherOptions.minSpace;
            options.maxSpace = otherOptions.maxSpace ==undefined ?options.maxSpace:otherOptions.maxSpace;
            
            // step = 4;
            mainLoop();
            return options;
        }

        const mainLoop = async function(){
            const data = Object.freeze(options.data);
            const step = options.step;
            const defaultColor = '#000000';
            let angle;
            let length = 100;//宽度
            let startX = canvas.width/2;
            let startY = canvas.height;
            let endX = startX;
            let endY = startY - Math.floor((Math.random() * (options.maxSpace -options.minSpace) + options.minSpace));
            
            ctx.lineWidth  = 50;
            ctx.strokeStyle = defaultColor;
            await drawLine(ctx,startX,startY,startX,endY,step);
            for(v of data){
                
                //画树枝
                angle = - v.angle;
                length = v.length;
                ctx.lineWidth  = 20;
                ctx.lineCap = 'butt';
                ctx.strokeStyle = v.color;
                let branckStartX = endX;
                let branckStartY = endY;
                let branckEndX = endX + Math.cos(angle / 180 * Math.PI) * length;
                let branckEndY = endY + Math.sin(angle / 180 * Math.PI) * length;
                await drawLineByAngle(ctx,branckStartX,branckStartY,angle,step,branckEndX,branckEndY);
               
                //画果子
                ///画果子的枝干
                ctx.lineWidth  = 5;
                ctx.strokeStyle = defaultColor;
                await drawLine(ctx,branckEndX,branckEndY,branckEndX,branckEndY + 20,step);
                ///画果子
                let radius = 20;
                ctx.strokeStyle = '#ff0000';
                angle = Math.PI * 3/2 ;
                await drawCircle(ctx,branckEndX,branckEndY + 20 ,step,radius,angle);
                ctx.fillStyle = '#ff0000';
                ctx.fill();

                //绘制文本
                ctx.strokeStyle = defaultColor;
                ctx.fillStyle = defaultColor;
                ctx.font = '15px serif';
                ctx.wrapText(v.text,branckEndX - radius,branckEndY + 20 + 20 /2,2* radius);

                
                //画树干
                startX = endX;
                startY = endY;
                endY = startY - Math.floor((Math.random() * (options.maxSpace -options.minSpace) + options.minSpace));
                ctx.lineWidth  = 50;
                ctx.lineCap = 'square';
                ctx.strokeStyle = defaultColor;
                await drawLine(ctx,startX,startY,startX,endY,step);
            }

            

            

            // ctx.lineWidth  = 2;
            // startX = endX;
            // startY = endY;
            // let radius = 20;
            // angle = Math.PI - Math.PI /2;
            // let clockwise = false;
            // await drawCircle(ctx,startX,startY,step,radius,angle,clockwise);
            
        }
        
        /**
         * 获取绘制的下一个点
         * @param {*} startX   起始点X
         * @param {*} startY   起始点Y
         * @param {*} endX     结束点X
         * @param {*} endY     结束点Y
         * @param {Number} step     步长
         */
        const getNextPoint = function(startX,startY,endX,endY,step){
            let point = {
                x:endX,
                y:endY
            }
            let detalX = 0,detalY = 0;
            if(startX != endX){
                detalX = Math.sin(Math.atan((endX - startX)/(endY - startY))) * step;
                if(Math.abs(endX - startX) > Math.abs(detalX)){
                    point.x = startX + detalX;
                }else{
                    point.x = endX;
                }
            }else{
                point.x = endX;
            }
            if(startY != endY){
                detalY = -Math.cos(Math.atan((endX - startX)/(endY - startY))) * step;
                if(Math.abs(endY - startY) > Math.abs(detalY)){
                    point.y = startY + detalY;
                }else{
                    point.y = endY;
                }  
            }else{
                point.y = endY;
            }

            return point;
        }


        /**
         * 获取下一帧的点
         * @param {*} startX 
         * @param {*} startY 
         * @param {*} angle 
         * @param {Number} step 
         * @param {*} endX 
         * @param {*} endY 
         */
        const getNextPointByAngle = function(startX,startY,angle,step,endX,endY){
            // let endX = startX + Math.cos(angle) * length;
            // let endY = startY + Math.sin(angle) * length;
            let absAngle = ((angle % 360) + 360) % 360;
            let nextX,nextY;

            let detalX = Math.cos(angle / 180 * Math.PI) * step;
            let detalY = Math.sin(angle / 180 * Math.PI) * step;
            if(absAngle > 90 && absAngle < 270 ){
                //坐标轴右半区域
                //右边区域当新x比结束x小的时候，结束
                if(startX + detalX < endX){
                    nextX = endX;
                }else{
                    nextX = startX + detalX;
                }

            }else if(absAngle < 90 || absAngle > 270 ){
                //坐标轴左半区域
                //左边区域当新x比结束x大的时候，结束
                if(startX + detalX > endX){
                    nextX = endX;
                }else{
                    nextX = startX + detalX;
                }
            }else{
                //垂直轴上x不变
                nextX = endX;
            }
            if(absAngle > 0 && absAngle < 180){
                //坐标轴上半区域
                //上边区域当新y比结束y大的时候，结束
                if(startY + detalY > endY){
                    nextY = endY;
                }else{
                    nextY = startY + detalY;
                }
            }else if(absAngle > 180 && absAngle < 360){
                //坐标轴下半区域
                //下边区域当新y比结束y小的时候，结束
                if(startY + detalY < endY){
                    nextY = endY;
                }else{
                    nextY = startY + detalY;
                }
            }else{
                //水平轴上x不变
                nextY = endY;
            }
            return {x:nextX ,y:nextY}
        }

        /**
         * 绘制直线
         * @param {*} context  画板
         * @param {*} startX   起始点X
         * @param {*} startY   起始点Y
         * @param {*} endX     结束点X
         * @param {*} endY     结束点Y
         * @param {Number} step     步长
         */
        const drawLine = function(context,startX,startY,endX,endY,step){
            return new Promise((resolve, reject) => {
                const update = (context,startX,startY,endX,endY,step) => {
                    if(startX != endX || startY != endY){
                        let netxPoint = getNextPoint(startX,startY,endX,endY,step);
                    
                        context.beginPath();
                        context.moveTo(startX,startY);
                        context.lineTo(netxPoint.x,netxPoint.y);
                        context.stroke();
                   
                        window.requestAnimFrame(update.bind(this,context,netxPoint.x,netxPoint.y,endX,endY,step));
                        
                    }else{
                        resolve();
                    }
                }
                update(context,startX,startY,endX,endY,step);
                // drawLineFrame(context,startX,startY,endX,endY,step,resolve);
                
            })
        }


        /**
         * 根据角度绘制直线
         * @param {*} context 
         * @param {*} startX 
         * @param {*} startY 
         * @param {*} angle 
         * @param {Number} step 
         * @param {*} endX 
         * @param {*} endY 
         */
        const drawLineByAngle = function(context,startX,startY,angle,step,endX,endY){
            return new Promise((resolve,reject)=>{
                const update = (context,startX,startY,angle,step,endX,endY) => {
                    let {x:nextX,y:nextY} = getNextPointByAngle(startX,startY,angle,step,endX,endY);
                
                    if(startX != endX || startY != endY){
                        context.beginPath();
                        context.moveTo(startX,startY);
                        context.lineTo(nextX,nextY);
                        context.stroke();
                        window.requestAnimationFrame(update.bind(this,context,nextX,nextY,angle,step,endX,endY));
                    }else{
                        resolve();
                    }
                }
                update(context,startX,startY,angle,step,endX,endY);
            })
        }

        /**
         * 绘制圆形
         * @param {*} context 
         * @param {*} startX 起点X
         * @param {*} startY 起点Y
         * @param {Number} step 
         * @param {*} radius 
         * @param {*} angle  角度
         * @param {boolean} clockwise   逆时针
         */
        const drawCircle = function(context,startX,startY,step,radius,angle,clockwise = true){
            // x, y, radius, startAngle, endAngle
            return new Promise((resolve,reject)=>{
                // let detalRadius = 
                const update = (context,startX,startY,step,radius,startAngle,angle,clockwise) => {
                    let endAngle,isOverLoop = false;
                    
                    if(startAngle === angle){
                        isOverLoop = true;
                    }
                    if(!isOverLoop){
                        let detalAngle = step / radius;
                        if(!clockwise){
                            //顺时针
                            endAngle = (startAngle + detalAngle) > angle ?angle:(startAngle + detalAngle);
                        }else{
                            //逆时针
                            endAngle = (startAngle + detalAngle) < angle ?angle:(startAngle + detalAngle);
                        }
                        context.beginPath();
                        context.arc(startX,startY + radius,radius,startAngle,endAngle,clockwise);
                        context.stroke();
                        window.requestAnimationFrame(update.bind(this,context,startX,startY,step,radius,endAngle,angle,clockwise));
                    }else{
                        resolve();
                    }
                }
                update(context,startX,startY,step,radius,-Math.PI / 2,angle,clockwise);
            })
        }

        return{
            init:function(options){
                console.log('init options',options);
                this.options = init(options);
                return this;
            },
            options:{},
            obj:canvas,
        }
    }



    /**
     * by zhangxinxu from http://www.zhangxinxu.com/wordpress/?p=7362
     * 用于canvas绘制换行文本信息
     * @param text 文本
     * @param x x坐标
     * @param y y坐标
     * @param maxWidth 最大宽度(可缺省)，默认会使用canvas画布的width宽度作为maxWidth
     * @param lineHeight 最大高度(可缺省)，默认会使用<canvas>元素在DOM中继承的line-height作为行高
     */
    CanvasRenderingContext2D.prototype.wrapText = function (text, x, y, maxWidth, lineHeight) {
        if (typeof text != 'string' || typeof x != 'number' || typeof y != 'number') {
            return;
        }
        
        var context = this;
        var canvas = context.canvas;
        
        if (typeof maxWidth == 'undefined') {
            maxWidth = (canvas && canvas.width) || 300;
        }
        if (typeof lineHeight == 'undefined') {
            lineHeight = (canvas && parseInt(window.getComputedStyle(canvas).lineHeight)) || parseInt(window.getComputedStyle(document.body).lineHeight);
        }
        
        // 字符分隔为数组
        var arrText = text.split('');
        var line = '';
        
        for (var n = 0; n < arrText.length; n++) {
            var testLine = line + arrText[n];
            var metrics = context.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y);
                line = arrText[n];
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        context.fillText(line, x, y);
    };
})(window)