/*
sarine.viewer.3dfullinspection.assets - v0.15.0 -  Monday, October 10th, 2016, 3:42:10 PM 
*/
function MGlass(imageId, largeImageSrc, configObject, deleteCallback) {
    this.smallImage = document.getElementById(imageId);
    this.largeImage = new Image();
    this.largeImage.src = largeImageSrc;
    this.aspect = 2;
    this.isActive = true; 

    this.config = (configObject || {});

    $(document).bind("contextmenu", function (e) {
        return false;
        $('.alert').fadeToggle();
    });

    this.onMouseClick = function (e) {
        switch (e.which) {
            case 1:
                //alert('Left mouse button pressed');
                break;
            case 2:
                //alert('Middle mouse button pressed');
                break;
            case 3:
                //alert('Right mouse button pressed');
                deleteCallback()
                break;
            default:
            //alert('You have a strange mouse');
        }
    }
    this.onMouseMove = function (e) {
        if (typeof e === "undefined")
            e = event; 
        e.cancelBubble = true; //won't let the background image to move while magnify in use
        var wrapper = this;
        var mglassViewer = wrapper.childNodes[0];
        var img = wrapper.childNodes[1];
        var pageOffset = MGlass.getPageOffset();
        var imagePosition = MGlass.getElementPosition(img);
        var wrapperPosition = MGlass.getElementPosition(wrapper);
        var x = (e.clientX - document.body.scrollLeft + pageOffset.x - imagePosition.x);
        var y = (e.clientY - document.body.scrollTop + pageOffset.y - imagePosition.y); 
        y = y - (img.clientHeight / 4); //move the cursor to the lower part of the magnifier
        if (0 <= x &&
            0 <= y &&
            img.clientWidth >= x &&
            img.clientHeight >= y) {
           
            if (this.parentElement.className.indexOf("flip") > -1) {
                x = img.clientWidth - x;
                y = img.clientHeight - y;
            }
            
            mglassViewer.style.visibility = 'visible';            

            
            var left = x - (mglassViewer.clientWidth / this.tag.aspect);  
            var top = y - (mglassViewer.clientHeight / this.tag.aspect);

            //block the magnifier area to reach 10% of the left/right borders
            var percentageOut = 10; //percentage of magnifier out of the parent border            
            var leftMin = topMin = -((percentageOut / 100) * img.clientWidth); //-25px when image width is 250px
            var leftMax = topMax = img.clientWidth - ( mglassViewer.clientWidth - (img.clientWidth / 10));//100px when image width is 250px
            
            
            var dstX = -this.tag.largeImage.width / this.tag.aspect + (x * (this.tag.largeImage.width * this.tag.aspect - mglassViewer.clientWidth)) / img.clientWidth;
            var dstY = -this.tag.largeImage.height / this.tag.aspect + (y * (this.tag.largeImage.height * this.tag.aspect - mglassViewer.clientHeight)) / img.clientHeight;
            
            //set the position only if pointer is inside this borders
            var tempPosition = mglassViewer.style.backgroundPosition.split(' ');
            var tempX = tempPosition[0], 
                tempY = tempPosition[1];

            console.log('mag tempX, tempY, left, leftMin, leftMax', tempX, tempY, left, leftMin, leftMax);
            // if(left > leftMin  && left < leftMax){                
            //     mglassViewer.style.left = left + "px";
            //     var tempY = mglassViewer.style.backgroundPosition.split(' ')[1];
            //     var validY = typeof tempY === "undefined" || tempY.indexOf('px') !== -1;
            //     //mglassViewer.style.backgroundPositionX = (-dstX) + "px "; //backgroundPositionX not supported by Firefox              
            //     mglassViewer.style.backgroundPosition = (-dstX) + "px " +  (validY ? tempY : "");
            //     console.log('mag left > leftMin  && left < leftMax', mglassViewer.style.backgroundPosition);                
            // }
                
            // if(top > topMin && top < topMax){                 
            //     mglassViewer.style.top =  top + "px";
            //     var tempX = mglassViewer.style.backgroundPosition.split(' ')[0];
            //     var validX = typeof tempX === "undefined" || tempX.indexOf('px') !== -1;
            //     //mglassViewer.style.backgroundPositionY = (-dstY) + "px "; //backgroundPositionY not supported by Firefox
            //     mglassViewer.style.backgroundPosition = (validX ? (tempX + " ") : "")  +  (-dstY) + "px";
            //     console.log('mag top > topMin && top < topMax', mglassViewer.style.backgroundPosition);                         
            // }
            
            mglassViewer.style.left = left + "px";
            mglassViewer.style.top =  top + "px";
            
            var tempY = mglassViewer.style.backgroundPosition.split(' ')[1];
            var tempX = mglassViewer.style.backgroundPosition.split(' ')[0];
            
            var validY = typeof tempY === "undefined" || tempY.indexOf('px') !== -1;
            var validX = typeof tempX === "undefined" || tempX.indexOf('px') !== -1;
            
            mglassViewer.style.backgroundPositionX = (-dstX) + "px ";// +  (validY ? tempY : "");
            mglassViewer.style.backgroundPositionY = (-dstY) + "px";
            

        } else {            
            //mglassViewer.style.visibility = 'hidden';
        }
    }
    this.onMouseOut = function (e) {
        if (typeof e === "undefined")
            e = event;
        var wrapper = this;
        var mglassViewer = wrapper.childNodes[0];
        var img = wrapper.childNodes[1];
        var pageOffset = MGlass.getPageOffset();
        var imagePosition = MGlass.getElementPosition(img);

        if (!(imagePosition.x + img.getBoundingClientRect().left <= (e.clientX + pageOffset.x) &&
            imagePosition.y + img.getBoundingClientRect().top <= (e.clientY + pageOffset.y) &&
            imagePosition.x + img.getBoundingClientRect().left + img.clientWidth >= (e.clientX + pageOffset.x) &&
            imagePosition.y + img.getBoundingClientRect().top + img.clientHeight >= (e.clientY + pageOffset.y))) {
            //mglassViewer.style.visibility = 'hidden';
        }

    }


    var wrapperElement = document.createElement("DIV");
    wrapperElement.className = (this.config.wrapperClassName || "mglass_wrapper");
    wrapperElement.tag = this;
    wrapperElement.name = "mglass_wrapper";
    wrapperElement.style.width = this.smallImage.clientWidth + "px";
    wrapperElement.style.height = this.smallImage.clientHeight + "px";
    wrapperElement.onmousemove = this.onMouseMove;
    wrapperElement.onmouseout = this.onMouseOut;
    wrapperElement.onmousedown = this.onMouseClick;
    wrapperElement.deleteCallback = deleteCallback
    var viewerElement = document.createElement("DIV");
    viewerElement.className = (this.config.viewerClassName || "mglass_viewer");

    // if (this.smallImage.className.indexOf('flip') != -1 
    //     || document.getElementsByClassName("viewport")[0].className.indexOf("flip") != -1
    //     )
    //     wrapperElement.className += " flip";


    viewerElement.name = "mglass_viewer";

    if (this.config.innerHTML)
        viewerElement.innerHTML = this.config.innerHTML;

    var pictureBoxElement = document.createElement("DIV");
    pictureBoxElement.className = (this.config.pictureBoxClassName || "mglass_picture_box");
    pictureBoxElement.name = "mglass_picture_box";
    pictureBoxElement.style.width = this.smallImage.clientWidth + "px";
    pictureBoxElement.style.height = this.smallImage.clientHeight + "px";

    wrapperElement.appendChild(viewerElement);
    wrapperElement.appendChild(pictureBoxElement);

    this.smallImage.parentNode.replaceChild(wrapperElement, this.smallImage);
    pictureBoxElement.appendChild(this.smallImage);
    //this.largeImage.style.background = "black url('load.gif') no-repeat center center";

    //viewerElement.style.backgroundImage = "url('load.gif')";
    viewerElement.style.backgroundColor = "#878787";
    viewerElement.style.backgroundRepeat = "no-repeat";
    wrapperElement.onmousemove({clientX: 240 - MGlass.getPageOffset().x + MGlass.getElementPosition(wrapperElement.childNodes[1]).x, clientY: 240 - MGlass.getPageOffset().y + MGlass.getElementPosition(wrapperElement.childNodes[1]).y})
    viewerElement.style.backgroundPosition = "center center";
    viewerElement.style.left = (wrapperElement.clientWidth - viewerElement.clientWidth)/this.aspect + "px"
    viewerElement.style.top = (wrapperElement.clientHeight - viewerElement.clientHeight)/this.aspect + "px"

    var _this = this;
   /* if(typeof window.performance.mark !== "undefined")
        window.performance.mark("magnifier_full_download_start")*/

    this.largeImage.onload = function () {
        /*if(typeof window.performance.mark !== "undefined"){
            window.performance.mark("magnifier_full_download_end")
            window.performance.measure("magnifier_full_download", "magnifier_full_download_start", "magnifier_full_download_end")
            measure = window.performance.getEntriesByName('magnifier_full_download')[0]
            totalTime = measure.duration
            $("#magnifier_full_download>.value").html((totalTime / 1000).toFixed(3) + "s.")
            //if (totalTime > 100)
            //    _gaq("send", "event", document.version, "magnifier_full_download", {friendlyName : $.url().param("friendlyName"), totalTime :totalTime })

            window.performance.clearMarks("magnifier_full_download_start")
            window.performance.clearMarks("magnifier_full_download_end")
            window.performance.clearMeasures("magnifier_full_download")
        }*/
        viewerElement.style.backgroundImage = "url('" + this.src + "') ";
        viewerElement.style.backgroundColor = "#" + _this.config.background;
        viewerElement.style.backgroundRepeat = "no-repeat";
    }


    this.Delete = function () {
        wrapperElement.parentNode.replaceChild(this.smallImage, wrapperElement);
        this.isActive = false;
    }


}


/**
 * @return page current offset, that is object with x and y coordinates.
 */
MGlass.getPageOffset = function () {
    var scrOfX = 0, scrOfY = 0;
    if (typeof (window.pageYOffset) == 'number') {
        scrOfX = window.pageXOffset;
        scrOfY = window.pageYOffset;
    } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
        scrOfX = document.body.scrollLeft;
        scrOfY = document.body.scrollTop;
    } else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
        scrOfX = document.documentElement.scrollLeft;
        scrOfY = document.documentElement.scrollTop;
    }
    return { x: scrOfX, y: scrOfY };
}

/**
 * @return element's current offset, regarding all it's parents offset
 * @param {HTMLElement} obj element for which offset is calculated
 */
MGlass.getElementPosition = function (obj) {
    /*var curentLeft = 0, currentTop = 0;
     if (obj.offsetParent) {
     do {
     curentLeft += obj.offsetLeft;
     currentTop += obj.offsetTop;
     } while (obj = obj.offsetParent);
     }
     return { x: curentLeft, y: currentTop };*/
    return getElementAbsolutePos(obj)
}


function __getIEVersion() {
    var rv = -1; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer') {
        var ua = navigator.userAgent;
        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat(RegExp.$1);
    }
    return rv;
}

function __getOperaVersion() {
    var rv = 0; // Default value
    if (window.opera) {
        var sver = window.opera.version();
        rv = parseFloat(sver);
    }
    return rv;
}

var __userAgent = navigator.userAgent;
var __isIE = navigator.appVersion.match(/MSIE/) != null;
var __IEVersion = __getIEVersion();
var __isIENew = __isIE && __IEVersion >= 8;
var __isIEOld = __isIE && !__isIENew;

var __isFireFox = __userAgent.match(/firefox/i) != null;
var __isFireFoxOld = __isFireFox && ((__userAgent.match(/firefox\/2./i) != null) ||
    (__userAgent.match(/firefox\/1./i) != null));
var __isFireFoxNew = __isFireFox && !__isFireFoxOld;

var __isWebKit = navigator.appVersion.match(/WebKit/) != null;
var __isChrome = navigator.appVersion.match(/Chrome/) != null;
var __isOpera = window.opera != null;
var __operaVersion = __getOperaVersion();
var __isOperaOld = __isOpera && (__operaVersion < 10);

function __parseBorderWidth(width) {
    var res = 0;
    if (typeof(width) == "string" && width != null && width != "") {
        var p = width.indexOf("px");
        if (p >= 0) {
            res = parseInt(width.substring(0, p));
        }
        else {
            //do not know how to calculate other values
            //(such as 0.5em or 0.1cm) correctly now
            //so just set the width to 1 pixel
            res = 1;
        }
    }
    return res;
}

//returns border width for some element
function __getBorderWidth(element) {
    var res = new Object();
    res.left = 0;
    res.top = 0;
    res.right = 0;
    res.bottom = 0;
    if (window.getComputedStyle) {
        //for Firefox
        var elStyle = window.getComputedStyle(element, null);
        res.left = parseInt(elStyle.borderLeftWidth.slice(0, -2));
        res.top = parseInt(elStyle.borderTopWidth.slice(0, -2));
        res.right = parseInt(elStyle.borderRightWidth.slice(0, -2));
        res.bottom = parseInt(elStyle.borderBottomWidth.slice(0, -2));
    }
    else {
        //for other browsers
        res.left = __parseBorderWidth(element.style.borderLeftWidth);
        res.top = __parseBorderWidth(element.style.borderTopWidth);
        res.right = __parseBorderWidth(element.style.borderRightWidth);
        res.bottom = __parseBorderWidth(element.style.borderBottomWidth);
    }

    return res;
}

//returns the absolute position of some element within document
function getElementAbsolutePos(element) {
    var res = new Object();
    res.x = 0;
    res.y = 0;
    if (element !== null) {
        if (element.getBoundingClientRect) {
            var viewportElement = document.documentElement;
            var box = element.getBoundingClientRect();
            var scrollLeft = viewportElement.scrollLeft;
            var scrollTop = viewportElement.scrollTop;

            res.x = box.left + scrollLeft;
            res.y = box.top + scrollTop;

        }
        else { //for old browsers
            res.x = element.offsetLeft;
            res.y = element.offsetTop;

            var parentNode = element.parentNode;
            var borderWidth = null;

            while (offsetParent != null) {
                res.x += offsetParent.offsetLeft;
                res.y += offsetParent.offsetTop;

                var parentTagName =
                    offsetParent.tagName.toLowerCase();

                if ((__isIEOld && parentTagName != "table") ||
                    ((__isFireFoxNew || __isChrome) &&
                        parentTagName == "td")) {
                    borderWidth = kGetBorderWidth
                    (offsetParent);
                    res.x += borderWidth.left;
                    res.y += borderWidth.top;
                }

                if (offsetParent != document.body &&
                    offsetParent != document.documentElement) {
                    res.x -= offsetParent.scrollLeft;
                    res.y -= offsetParent.scrollTop;
                }


                //next lines are necessary to fix the problem
                //with offsetParent
                if (!__isIE && !__isOperaOld || __isIENew) {
                    while (offsetParent != parentNode &&
                        parentNode !== null) {
                        res.x -= parentNode.scrollLeft;
                        res.y -= parentNode.scrollTop;
                        if (__isFireFoxOld || __isWebKit) {
                            borderWidth =
                                kGetBorderWidth(parentNode);
                            res.x += borderWidth.left;
                            res.y += borderWidth.top;
                        }
                        parentNode = parentNode.parentNode;
                    }
                }

                parentNode = offsetParent.parentNode;
                offsetParent = offsetParent.offsetParent;
            }
        }
    }
    return res;
}
