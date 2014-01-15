( function ( root ) {
var Animator;

Animator = (function() {
  function Animator() {}

  return Animator;

})();

var Canvas;

Canvas = (function() {
  function Canvas() {}

  Canvas.prototype.scaleX = function(x) {
    return x + this.options.leftPadding;
  };

  Canvas.prototype.scaleY = function(y) {
    return this.options.usableHeight - y + this.options.topPadding;
  };

  Canvas.prototype.begin = function() {
    return this["continue"] = false;
  };

  Canvas.prototype.line = function(point) {
    var left, top;
    left = this.scaleX(point.x);
    top = this.scaleY(point.y);
    if (this["continue"]) {
      return this.context.lineTo(left, top);
    } else {
      this.context.beginPath();
      this.context.moveTo(left, top);
      return this["continue"] = true;
    }
  };

  Canvas.prototype.stroke = function() {
    return this.context.stroke();
  };

  Canvas.prototype.fill = function() {
    return this.context.fill();
  };

  Canvas.prototype.close = function() {
    return this.context.closePath();
  };

  Canvas.prototype.arc = function(point, offset, angle1, angle2, ccw) {
    var x, y;
    x = this.scaleX(point.x);
    y = this.scaleY(point.y);
    return this.context.arc(x, y, offset, angle1, angle2, ccw);
  };

  return Canvas;

})();

var Bobbograph;

Bobbograph = (function() {
  function Bobbograph(id, data, options) {
    this.options = new Options(options);
    this.context = this.getContext(id);
    this.data = new Data(data, this.options);
    new Render(this.data.pixels, this.context, this.options);
  }

  Bobbograph.prototype.getContext = function(id) {
    var canvas, context, element;
    element = document.getElementById(id);
    canvas = document.createElement('canvas');
    canvas.setAttribute('height', this.options.height);
    canvas.setAttribute('width', this.options.width);
    element.appendChild(canvas);
    return context = canvas.getContext('2d');
  };

  return Bobbograph;

})();

var Data;

Data = (function() {
  function Data(data, options) {
    this.options = options;
    this.data = this.formatData(data);
    this.stats = new Stats(this.data);
    this.points = this.getPoints(this.data, this.options, this.stats);
    this.pixels = this.getPixels(this.points, this.options.usableWidth, this.options.smoothGraph);
  }

  Data.prototype.scalePoint = function(val, min, delta, scale) {
    var percent, scaled, scoped;
    scoped = val - min;
    percent = scoped / delta;
    return scaled = percent * scale;
  };

  Data.prototype.getPoints = function(data, options, stats) {
    var dx, dy, point, usableHeight, usableWidth, x, xmin, y, ymin, _i, _len, _results;
    usableWidth = options.usableWidth, usableHeight = options.usableHeight;
    xmin = stats.xmin, ymin = stats.ymin, dx = stats.dx, dy = stats.dy;
    _results = [];
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      point = data[_i];
      x = this.scalePoint(point.x, xmin, dx, usableWidth);
      y = this.scalePoint(point.y, ymin, dy, usableHeight);
      _results.push(new Point(x, y));
    }
    return _results;
  };

  Data.prototype.formatData = function(data) {
    var index, points, sortMethod, val, _i, _len, _results;
    sortMethod = function(a, b) {
      return a.x - b.x;
    };
    if (typeof data[0] === 'number') {
      _results = [];
      for (index = _i = 0, _len = data.length; _i < _len; index = ++_i) {
        val = data[index];
        _results.push(new Point(index, val));
      }
      return _results;
    } else if (data[0] instanceof Array) {
      points = (function() {
        var _j, _len1, _results1;
        _results1 = [];
        for (index = _j = 0, _len1 = data.length; _j < _len1; index = ++_j) {
          val = data[index];
          _results1.push(new Point(val[0], val[1]));
        }
        return _results1;
      })();
      return points.sort(sortMethod);
    } else if (data[0] && (data[0].x != null) && (data[0].y != null)) {
      points = (function() {
        var _j, _len1, _results1;
        _results1 = [];
        for (index = _j = 0, _len1 = data.length; _j < _len1; index = ++_j) {
          val = data[index];
          _results1.push(new Point(val.x, val.y));
        }
        return _results1;
      })();
      return points.sort(sortMethod);
    }
  };

  Data.prototype.getPixels = function(points, width, curve) {
    var index, lastPoint, method, pixels, point, _i, _j, _len, _ref, _ref1;
    method = curve ? Easing.curve : Easing.linear;
    pixels = new Array(width);
    for (_i = 0, _len = points.length; _i < _len; _i++) {
      point = points[_i];
      if (typeof lastPoint !== "undefined" && lastPoint !== null) {
        for (index = _j = _ref = Math.round(lastPoint.x), _ref1 = Math.round(point.x); _ref <= _ref1 ? _j <= _ref1 : _j >= _ref1; index = _ref <= _ref1 ? ++_j : --_j) {
          pixels[index] = new Point(index, method(index - lastPoint.x, lastPoint.y, point.y - lastPoint.y, point.x - lastPoint.x));
        }
      }
      lastPoint = point;
    }
    return pixels;
  };

  return Data;

})();

var Easing;

Easing = (function() {
  function Easing() {}

  Easing.curve = function(t, b, c, d) {
    if ((t /= d / 2) < 1) {
      return c / 2 * Math.pow(t, 2) + b;
    } else {
      return -c / 2 * ((t - 1) * (t - 3) - 1) + b;
    }
  };

  Easing.linear = function(t, b, c, d) {
    return c * t / d + b;
  };

  return Easing;

})();

var Options;

Options = (function() {
  Options.prototype.height = 300;

  Options.prototype.width = 600;

  Options.prototype.bevel = false;

  Options.prototype.bevelIntensity = 1;

  Options.prototype.shineIntensity = 0.65;

  Options.prototype.shadowIntensity = 0.3;

  Options.prototype.smoothBevel = false;

  Options.prototype.lineWidth = 10;

  Options.prototype.color = '#000';

  Options.prototype.shadow = false;

  Options.prototype.fill = false;

  Options.prototype.verticalFill = false;

  Options.prototype.dashed = false;

  Options.prototype.dashSize = 5;

  Options.prototype.maxPoints = false;

  Options.prototype.peaksAndValleys = false;

  Options.prototype.verticalLineFill = false;

  Options.prototype.smoothGraph = false;

  Options.prototype.smoothingMethod = false;

  Options.prototype.normalRange = false;

  Options.prototype.animationDuration = 0;

  Options.prototype.easingMethod = false;

  Options.prototype.callback = false;

  Options.prototype.maxX = false;

  Options.prototype.maxY = false;

  Options.prototype.minX = false;

  Options.prototype.minY = false;

  Options.prototype.percent = 1;

  Options.prototype.padding = null;

  Options.prototype.xPadding = null;

  Options.prototype.yPadding = null;

  Options.prototype.leftPadding = null;

  Options.prototype.rightPadding = null;

  Options.prototype.topPadding = null;

  Options.prototype.bottomPadding = null;

  Options.prototype.usableWidth = null;

  Options.prototype.usableHeight = null;

  function Options(options) {
    var key, value;
    if (options == null) {
      options = {};
    }
    for (key in options) {
      value = options[key];
      this[key] = value;
    }
    this.calculatePadding();
  }

  Options.prototype.calculatePadding = function() {
    if (this.padding == null) {
      this.padding = this.lineWidth;
    }
    if (this.xPadding == null) {
      this.xPadding = this.padding;
    }
    if (this.yPadding == null) {
      this.yPadding = this.padding;
    }
    if (this.leftPadding == null) {
      this.leftPadding = this.xPadding;
    }
    if (this.rightPadding == null) {
      this.rightPadding = this.xPadding;
    }
    if (this.topPadding == null) {
      this.topPadding = this.yPadding;
    }
    if (this.bottomPadding == null) {
      this.bottomPadding = this.yPadding;
    }
    this.usableWidth = this.width - this.leftPadding - this.rightPadding;
    return this.usableHeight = this.height - this.topPadding - this.bottomPadding;
  };

  return Options;

})();

var Point;

Point = (function() {
  function Point(x, y) {
    this.x = x;
    this.y = y;
  }

  Point.prototype.getAngle = function(point) {
    var p1, p2, _ref;
    _ref = point.x > this.x ? [this, point] : [point, this], p1 = _ref[0], p2 = _ref[1];
    return Trig.getAngleFromPoints(p1, p2);
  };

  Point.prototype.offsetPoint = function(prev, next, offset, angleOffset) {
    var angle, perp, point;
    if (prev == null) {
      prev = this;
    }
    if (next == null) {
      next = this;
    }
    angle = Trig.getAngleFromPoints(prev, next);
    perp = angle + angleOffset;
    return point = Trig.getPointFromAngle(this, perp, offset);
  };

  return Point;

})();

var Render,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Render = (function(_super) {
  __extends(Render, _super);

  function Render(pixels, context, options) {
    this.pixels = pixels;
    this.context = context;
    this.options = options;
    this.renderSolid(this.pixels, this.options.lineWidth);
  }

  Render.prototype.renderLine = function(pixels, lineWidth, angleOffset) {
    var index, next, pixel, prev, _i, _len, _results;
    _results = [];
    for (index = _i = 0, _len = pixels.length; _i < _len; index = ++_i) {
      pixel = pixels[index];
      prev = pixels[index - 1];
      next = pixels[index + 1];
      _results.push(this.line(pixel.offsetPoint(prev, next, lineWidth, angleOffset)));
    }
    return _results;
  };

  Render.prototype.renderCap = function(point, right, offset) {
    if (right) {
      return this.arc(point, offset, -Math.PI / 2, Math.PI / 2);
    } else {
      return this.arc(point, offset, Math.PI / 2, -Math.PI / 2);
    }
  };

  Render.prototype.renderSolid = function(pixels, lineWidth) {
    var angle, offset;
    offset = lineWidth / 2;
    angle = Math.PI / 2;
    this.begin();
    this.renderLine(pixels, offset, angle);
    this.renderCap(pixels[pixels.length - 1], true, offset);
    this.renderLine(pixels.slice().reverse(), offset, angle);
    this.renderCap(pixels[0], false, offset);
    this.close();
    return this.stroke();
  };

  return Render;

})(Canvas);

var Stats;

Stats = (function() {
  function Stats(data) {
    this.getRangeData(data);
  }

  Stats.prototype.getRangeData = function(data) {
    var point, xarr, yarr;
    xarr = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        point = data[_i];
        _results.push(point.x);
      }
      return _results;
    })();
    yarr = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        point = data[_i];
        _results.push(point.y);
      }
      return _results;
    })();
    this.xmin = Math.min.apply(null, xarr);
    this.xmax = Math.max.apply(null, xarr);
    this.ymin = Math.min.apply(null, yarr);
    this.ymax = Math.max.apply(null, yarr);
    this.dx = this.xmax - this.xmin;
    return this.dy = this.ymax - this.ymin;
  };

  return Stats;

})();

var Trig;

Trig = (function() {
  function Trig() {}

  Trig.rad = function(deg) {
    return deg * Math.PI / 180;
  };

  Trig.deg = function(rad) {
    return rad * 180 / Math.PI;
  };

  Trig.getBaseAngleFromPoints = function(dx, dy) {
    var angle;
    angle = Math.atan(dy / dx);
    return Math.abs(angle);
  };

  Trig.getQuadrant = function(dx, dy) {
    if (dy >= 0) {
      if (dx >= 0) {
        return 1;
      } else {
        return 2;
      }
    } else {
      if (dx < 0) {
        return 3;
      } else {
        return 4;
      }
    }
  };

  Trig.getAngleFromPoints = function(p1, p2) {
    var baseAngle, dx, dy;
    dx = p2.x - p1.x;
    dy = p2.y - p1.y;
    baseAngle = this.getBaseAngleFromPoints(dx, dy);
    switch (this.getQuadrant(dx, dy)) {
      case 1:
        return baseAngle;
      case 2:
        return Math.PI - baseAngle;
      case 3:
        return Math.PI + baseAngle;
      case 4:
        return 2 * Math.PI - baseAngle;
    }
  };

  Trig.getDistanceBetweenPoints = function(p1, p2) {
    var distance, dx, dy;
    dx = p2.x - p1.x;
    dy = p2.y - p1.y;
    return distance = Math.sqrt(dx * dx + dy * dy);
  };

  Trig.getPointFromAngle = function(origin, angle, distance) {
    var x, y;
    x = origin.x, y = origin.y;
    if (angle === Math.PI) {
      return new Point(x - distance, y);
    } else if (angle === Math.PI / 2) {
      return new Point(x, y + distance);
    } else if (angle === Math.PI * 1.5) {
      return new Point(x, y - distance);
    } else if (angle === 0) {
      return new Point(x + distance, y);
    } else {
      return new Point(Math.cos(angle) * distance + x, Math.sin(angle) * distance + y);
    }
  };

  return Trig;

})();

var Util;

Util = (function() {
  function Util() {}

  Util.excanvas = typeof G_vmlCanvasManager !== 'undefined';

  Util.getProperty = function(obj, namespace, notFoundValue) {
    var part, _i, _len, _ref;
    if (obj == null) {
      return notFoundValue;
    }
    _ref = namespace.split('.');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      part = _ref[_i];
      obj = obj[part];
      if (obj == null) {
        return notFoundValue;
      }
    }
    return obj;
  };

  Util.minMax = function(num, min, max) {
    if (num > max) {
      return max;
    } else if (num < min) {
      return min;
    } else {
      return num;
    }
  };

  return Util;

})();
  root.get = function (str) { return eval(str) };
})(this);