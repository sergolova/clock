Clock.DEFAULT_LEFT = 200;
Clock.DEFAULT_TOP = 200;
Clock.DEFAULT_RADIUS = 200;
Clock.DEFUALT_UPDATE = 500; //ms
Clock.DEFUALT_HOUR_START = 0;
Clock.DEFUALT_HOUR_END = 60;
Clock.DEFUALT_MIN_START = 0;
Clock.DEFUALT_MIN_END = 80;
Clock.DEFUALT_SEC_START = 70;
Clock.DEFUALT_SEC_END = 99;
Clock.DEFAULT_FONT = "32px serif";
Clock.HOUR_DIVIDER = 12;
Clock.MIN_DIVIDER = 60;
Clock.SEC_DIVIDER = Clock.MIN_DIVIDER;
Clock.IMAGE_SIZE = 50;
Clock.DEFUALT_DIAL_WIDTH = 5;

function Arrow(max, start, end, width, color) {
    this.start = start;
    this.end = end;
    this.width = width;
    this.color = color;
    this.maxValue = max;
}

function Dial(color1, color2, font, borderWidth, borderColor, timeFont, timeColor, imageSize) {
    this.color1 = color1;
    this.color2 = color2;
    this.font = font;
    this.borderWidth = borderWidth;
    this.borderColor = borderColor;
    this.imageSize = imageSize;
    this.hourSerif = new Arrow(Clock.HOUR_DIVIDER, 95, 97, 3, 'black');
    this.minSerif = new Arrow(Clock.MIN_DIVIDER, 90, 98, 2, 'rgb(80,80,80)');
    this.timeFont = timeFont;
    this.timeColor = timeColor;
}

function Clock(centerLeft, centerTop, radius) {
    this.center = new Point(centerLeft || Clock.DEFAULT_LEFT, centerTop || Clock.DEFAULT_TOP);
    this.radius = radius || Clock.DEFAULT_RADIUS;
    this.context = null;
    this.isStarted = false;

    this.hourArrow = new Arrow(12, Clock.DEFUALT_HOUR_START, Clock.DEFUALT_HOUR_END, 5, 'blue');
    this.minArrow = new Arrow(60, Clock.DEFUALT_MIN_START, Clock.DEFUALT_MIN_END, 3, 'black');
    this.secArrow = new Arrow(60, Clock.DEFUALT_SEC_START, Clock.DEFUALT_SEC_END, 2, 'red');

    this.dial = new Dial('black', 'gray', Clock.DEFAULT_FONT, Clock.DEFUALT_DIAL_WIDTH, 'black', '30px Tahoma', 'green', Clock.IMAGE_SIZE);

    // private
    this._timer = null;
    this._update = Clock.DEFUALT_UPDATE;
    this._img = new Image();
    this._img.src = 'center.png';

    // properties
    this.updateInterval = Object.defineProperty(this, 'updateInterval', {
        set: function (value) {
            this._update = value || Clock.DEFUALT_UPDATE;
            if (this.isStarted) {
                this.start();
            }
        },
        get: function () {
            return this._update;
        }
    });
}

Clock.prototype.setAutoSizes = function () {
    let rad = this.radius;
    this.dial.font = 0.1800 * rad + 'px tahoma';
    this.dial.minSerif.width = 0.0117 * rad;
    this.dial.hourSerif.width = 0.0176 * rad;
    this.dial.borderWidth = 0.0294 * rad;
    this.dial.timeFont = 0.1764 * rad + 'px Tahoma';
    this.hourArrow.width = 0.0294 * rad;
    this.minArrow.width = 0.0176 * rad;
    this.secArrow.width = 0.0117 * rad;
    this.dial.imageSize = 0.2941 * rad;
};

Clock.prototype.getTime = function () {
    return new Date();

};

Clock.prototype.clearCanvas = function () {
    let bw = this.dial.borderWidth / 2;
    let rad = Math.ceil(this.radius + bw);
    this.context.clearRect(this.center.x - rad, this.center.y - rad, rad * 2, rad * 2);

};

Clock.prototype._drawArrow = function (ctx, value, arrow) {
    let pt1 = this._getArrowPoint(value, arrow.maxValue, arrow.start);
    let pt2 = this._getArrowPoint(value, arrow.maxValue, arrow.end);
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineWidth = arrow.width;
    ctx.strokeStyle = arrow.color;
    ctx.moveTo(pt1.x, pt1.y);
    ctx.lineTo(pt2.x, pt2.y);
    ctx.stroke();
};

Clock.prototype._drawDial = function (ctx) {
    ctx.beginPath();

    var grd = ctx.createRadialGradient(this.center.x, this.center.y, 0, this.center.x, this.center.y, this.radius);
    grd.addColorStop(0, this.dial.color1);
    grd.addColorStop(1, this.dial.color2);

    //ctx.moveTo(this.center.x, this.center.y);
    ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.lineWidth = this.dial.borderWidth;
    ctx.strokeStyle = this.dial.borderColor;
    ctx.stroke();

    ctx.beginPath();
    ctx.font = this.dial.font;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'yellow';


    for (let i = 1; i <= Clock.HOUR_DIVIDER; i++) {
        this._drawArrow(ctx, i, this.dial.hourSerif);

        let pt = this._getArrowPoint(i, Clock.HOUR_DIVIDER, 85);
        ctx.fillText(i, pt.x, pt.y);
    }

    for (let i = 1; i <= Clock.MIN_DIVIDER; i++) {
        if (i % ( Clock.MIN_DIVIDER / Clock.HOUR_DIVIDER ) === 0) {
            continue
        }
        this._drawArrow(ctx, i, this.dial.minSerif);
    }

    ctx.stroke();

    let pt = this._getArrowPoint(6, Clock.HOUR_DIVIDER, 35);
    let time = this.getTime();
    let timeStr = time.toLocaleString("ru-ru", {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    });
    ctx.font = this.dial.timeFont;
    ctx.fillStyle = this.dial.timeColor;
    ctx.fillText(timeStr, pt.x, pt.y);
};

Clock.prototype._drawTopLayer = function (ctx) {
    let sz = this.dial.imageSize;
    let x = this.center.x - sz / 2;
    let y = this.center.y - sz / 2;
    ctx.drawImage(this._img, x, y, sz, sz);
};

Clock.prototype.redraw = function () {
    let ctx = this.context;
    let time = this.getTime();

    this.clearCanvas();
    
    this._drawDial(ctx);
    this._drawArrow(ctx, time.getSeconds(), this.secArrow);
    this._drawArrow(ctx, time.getMinutes()+time.getSeconds()/60, this.minArrow);
    this._drawArrow(ctx, time.getHours()+time.getMinutes()/60, this.hourArrow);
    this._drawTopLayer(ctx);
};

Clock.prototype._getArrowPoint = function (value, maxValue, lenPercents) {
    return this._angleToPoint(Math.PI * 1.5 + Math.PI * 2 * value / maxValue, lenPercents);
};

Clock.prototype._angleToPoint = function (angle, radius = 100, asPercents = true) {
    let len = asPercents ? this.radius * radius / 100 : radius;
    return new Point(
        this.center.x + len * Math.cos(angle),
        this.center.y + len * Math.sin(angle),
    );
};

Clock.prototype.start = function () {
    this.stop();
    this.isStarted = true;
    setInterval(this.redraw.bind(this), this.updateInterval);
};

Clock.prototype.stop = function () {
    clearInterval(this._timer);
    this.isStarted = false;
};

Clock.prototype.prepareCanvas = function (canvasID) {
    var cnv = document.getElementById(canvasID);
    if (cnv.getContext) {
        this.context = cnv.getContext('2d');
        return true;
    } else {
        return false;
    }
};