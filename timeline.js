var Timeline;
Timeline = (function() {
  function Timeline(raphael, options, timelines) {
    this.raph = raphael;
    this.opt = options;
    this.tls = timelines;
    this.tls_imgs = [];
    this.bg = null;
  }
  Timeline.prototype.drawNode = function(x1, y1, c1, info) {
    var c, impact, radius, txt;
    impact = parseInt(info.impact, 10);
    if (impact != null) {
      impact = 1;
    }
    radius = Math.floor(this.opt.nodeRadius * impact);
    c = this.raph.circle(x1, y1, radius);
    txt = this.raph.text(x1, y1 + 20, info.time + ' ' + info.label);
    txt.hide();
    c.node.onmouseover = function() {
      c.toFront();
      txt.toFront();
      txt.attr({
        "stroke": '#000000',
        "fill": '#000000',
        "stroke-width": 1,
        "text-anchor": "start",
        "font-size": 12
      });
      return txt.show();
    };
    c.node.onmouseout = function() {
      return txt.hide();
    };
    return [c, txt];
  };
  Timeline.prototype.drawPath = function(tl, x1, x2, y, c1, c2) {
    var interval, line1, px1, px2, start;
    interval = this.opt.x_interval;
    start = this.opt.start;
    px1 = interval * (x1 - start);
    px2 = interval * (x2 - start);
    line1 = this.raph.path("M" + px1 + " " + y + "L" + px2 + " " + y);
    tl.push(line1);
  };
  Timeline.prototype.drawPeriod = function(period, y, c1, c2) {
    return this.drawNode(this.opt.x_interval * (period.time - this.opt.start), y, c1, period);
  };
  Timeline.prototype.drawTimeline = function(timeline, y) {
    var c1, period, tl, tl_end, tl_start, tmp_node, _i, _len, _ref;
    tl = this.raph.set();
    if (timeline.is_visible) {
      tl_start = this.opt.date_min;
      tl_end = this.opt.date_max;
    }
    c1 = timeline.color;
    this.drawPath(tl, Math.max(tl_start, timeline.t_start), Math.min(tl_end, timeline.t_end), y, c1);
    _ref = timeline.periods;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      period = _ref[_i];
      tmp_node = this.drawPeriod(period, y, c1);
      tl.push(tmp_node[0]);
      tl.push(tmp_node[1]);
    }
    tl.attr({
      fill: this.opt.bgcolor,
      stroke: c1,
      "stroke-width": 4
    });
    this.raph.text(20, y - 20, timeline.title + ' (' + timeline.t_start + ' 〜 ' + timeline.t_end + ')').attr({
      stroke: '#000000',
      fill: '#000000',
      "text-anchor": "start",
      "font-size": 12
    });
    return tl;
  };
  Timeline.prototype.drawBackground = function() {
    var backgroundline, base_start, diff, end, footer_line, h, line1, line2, start, txt, txts, w, x, x1, x2, year, _i, _len;
    w = this.opt.width;
    h = this.opt.height;
    footer_line = h - 40;
    backgroundline = this.raph.set();
    start = this.opt.date_min;
    end = this.opt.date_max;
    base_start = this.opt.start;
    year = start;
    diff = Math.floor((this.opt.end - this.opt.start) / 10);
    if (diff === 0) {
      diff = 1;
    }
    x1 = Math.floor(this.opt.x_interval * (start - base_start));
    x2 = Math.floor(this.opt.x_interval * (end - base_start));
    line2 = this.raph.path("M" + x1 + " " + footer_line + "L" + x2 + " " + footer_line);
    backgroundline.push(line2);
    year = start;
    txts = [];
    while (year <= end) {
      x = Math.floor(this.opt.x_interval * (year - base_start));
      line1 = this.raph.path('M' + x + ' 0L' + x + ' ' + footer_line);
      backgroundline.push(line1);
      txts.push(this.raph.text(x, footer_line + 10, year).attr({
        stroke: '#000000',
        fill: '#000000'
      }));
      year += diff;
    }
    backgroundline.attr({
      'stroke': '#aaaaaa',
      'stroke-width': 0.5
    });
    for (_i = 0, _len = txts.length; _i < _len; _i++) {
      txt = txts[_i];
      backgroundline.push(txt);
    }
    this.bg = backgroundline;
  };
  Timeline.prototype.drawMove = function(v) {
    var tls_img, _i, _len, _ref;
    _ref = this.tls_imgs;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      tls_img = _ref[_i];
      tls_img.translate(v, 0);
    }
    this.bg.translate(v, 0);
  };
  Timeline.prototype.draw = function() {
    var interval, tl, y, _i, _len, _ref;
    this.tls_imgs = [];
    this.drawBackground();
    interval = this.opt.y_interval;
    y = interval;
    _ref = this.tls;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      tl = _ref[_i];
      this.tls_imgs.push(this.drawTimeline(tl, y));
      y += interval;
    }
  };
  Timeline.prototype.clear = function() {
    this.raph.clear();
  };
  Timeline.prototype.redraw = function() {
    this.clear();
    this.draw();
  };
  Timeline.prototype.setNodeSize = function() {
    this.opt.nodeRadius = v;
    this.redraw();
  };
  Timeline.prototype.setViewArea = function(v_start, v_end) {
    var end, start;
    start = parseInt(v_start, 10);
    end = parseInt(v_end, 10);
    this.opt.start = start;
    this.opt.end = end;
    this.setRange(end - start);
    this.redraw();
  };
  Timeline.prototype.setMove = function(moveDate) {
    moveDate = parseInt(moveDate, 10);
    if ((moveDate > 0 && this.opt.start - moveDate >= this.opt.date_min) || (moveDate < 0 && this.opt.end - moveDate <= this.opt.date_max)) {
      this.opt.start = this.opt.start - moveDate;
      this.opt.end = this.opt.end - moveDate;
      this.drawMove(this.opt.x_interval * moveDate);
      return true;
    }
    return false;
  };
  Timeline.prototype.setRange = function(v_range) {
    var x_interval;
    this.opt.range = v_range;
    if (v_range <= 0) {
      return;
    }
    x_interval = this.opt.width / v_range;
    if (x_interval > 0) {
      this.opt.x_interval = x_interval;
    }
  };
  Timeline.prototype.setStart = function(v) {
    return this.setViewArea(v, this.opt.end);
  };
  Timeline.prototype.setEnd = function(v) {
    return this.setViewArea(this.opt.start, v);
  };
  Timeline.prototype.getStart = function() {
    return this.opt.start;
  };
  Timeline.prototype.getEnd = function() {
    return this.opt.end;
  };
  Timeline.prototype.readJSON = function(v) {
    this.tls = v;
    this.redraw();
  };
  return Timeline;
})();