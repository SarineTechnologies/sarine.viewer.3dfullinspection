(function ($) {
    $.fn.elasticmousedrag = function (handler) {

        timeStamp = mouseX = mouseY = null;
        vth = 0.1;
        k = 0.5;
        dragEnable = false;
        $elem = $(this);
        this.mousedown(function (ev) {
            $(this).css("background-position-x", 100);
            dragEnable = true;
            mouseX = ev.clientX;
            mouseY = ev.clientY;
            timeStamp = ev.timeStamp;
            handler(ev, "down");
            $(this).stop();
        }).mousemove(function (ev) {
                if (dragEnable) {
                    if (ev.timeStamp - timeStamp > 250) {
                        mouseX = ev.clientX;
                        mouseY = ev.clientY;
                        timeStamp = ev.timeStamp;
                    }
                    handler(ev);
                }

            }).mouseup(function (ev) {
                momentmove(ev, this);
            }).mouseleave(function (ev) {
                momentmove(ev, this);
            });

        function momentmove(ev, obj) {
            if (dragEnable) {
                $(obj).stop();

                v0x = (ev.clientX - mouseX) / (ev.timeStamp - timeStamp);
                v0y = (ev.clientY - mouseY) / (ev.timeStamp - timeStamp);
                t0x = Math.abs(Math.log(vth / Math.abs(v0x)) * (k));
                t0y = Math.abs(Math.log(vth / Math.abs(v0y))) * (k);
                x0 = ev.clientX;
                y0 = ev.clientY;

                if (Math.max(t0x, t0y) > 0 && Math.max(t0x, t0y) != Infinity && (Math.abs(v0x) > vth || Math.abs(v0y) > vth)) {
                    $(obj).stop();
                    $(obj).animate({
                        backgroundPositionX: 0
                    }, {
                        duration: Math.max(t0x, t0y) * 1000,
                        step: function (currentStep) {

                            t = Math.max(t0x, t0y) / 100 * (100 - currentStep);

                            x = v0x * Math.exp(-1 / k * t) / k + x0;
                            y = v0y * Math.exp(-1 / k * t) / k + y0;
                            x0 = x;
                            y0 = y;
                            ev.clientX = x;
                            //ev.clientY = y;
                            mouseX = x;
                            mouseY = y;
                            timeStamp = ev.timeStamp;
                            handler(ev);

                        }
                    });
                }

                dragEnable = false;
            }
        }

        return this;
    };


})(jQuery);