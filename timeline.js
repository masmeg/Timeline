(function() {
  var Timeline;
  Timeline = (function() {
    function Timeline(raphael, options, timelines) {
      this.r = raphael;
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
      radius = Math.floor(opt.nodeRadius * impact);
      c = r.circle(x1, y1, radius);
      txt = r.text(x1, y1 + 20, info.time + ' ' + info.label);
      txt.hide();
      c.node.onmouseover(function() {
        c.toFront();
        txt.toFront();
        return txt.attr({
          "stroke": '#000000',
          "fill": '#000000',
          "stroke-width": 1,
          "text-anchor": "start",
          "font-size": 12
        });
      });
      txt.show();
      c.node.onmouseout(function() {
        return txt.hide();
      });
      return [c, txt];
    };
    Timeline.prototype.drawPath = function(tl, x1, x2, y, c1, c2) {
      var interval, line1, start;
      interval = opt.x_interval;
      start = opt.start;
      line1 = r.path('M' + (interval * (x1 - start)) + ' ' + y, +'L' + (interval * (x2 - start)) + ' ' + y);
      return tl.push(line1);
    };
    Timeline.prototype.drawPeriod = function(period, y, c1, c2) {
      return this.drawNode(opt.x_interval * (period.time - opt.start), y, c1, period);
    };
    Timeline.prototype.drawTimeline = function(timeline, y) {
      var c1, period, periods, tl, tl_end, tl_start, tmp_node, _i, _len;
      tl = r.set();
      if (timeline.is_visible) {
        tl_start = opt.date_min;
        tl_end = opt.date_max;
      }
      c1 = timeline.color;
      this.drawPath(tl, Math.max(tl_start, timeline.t_start), Math.min(tl_end, timeline.t_end), y, c1);
      periods = timeline.periods;
      for (_i = 0, _len = periods.length; _i < _len; _i++) {
        period = periods[_i];
        tmp_node = this.drawPeriod(period, y, c1);
        tl.push(tmp_node[0]);
        tl.push(tmp_node[1]);
      }
      tl.attr({
        "fill": opt.bgcolor,
        "stroke": c1,
        "stroke-width": 4
      });
      r.text(20, y - 20, timeline.title + ' (' + timeline.t_start + ' 〜 ' + timeline.t_end + ')').attr({
        "stroke": '#000000',
        "fill": '#000000',
        "text-anchor": "start",
        "font-size": 12
      });
      return tl;
    };
    Timeline.prototype.drawBackground = function() {
      var backgroundline, base_start, bg, diff, end, footer_line, h, i, line1, line2, start, txts, w, x, x1, x2, year;
      w = opt.width;
      h = opt.height;
      footer_line = h - 40;
      backgroundline = r.set();
      txts = [];
      start = opt.date_min;
      end = opt.date_max;
      base_start = opt.start;
      year = start;
      diff = Math.floor((opt.end - opt.start) / 10);
      if (diff === 0) {
        diff = 1;
      }
      x1 = Math.floor(opt.x_interval * (start - base_start));
      x2 = Math.floor(opt.x_interval * (end - base_start));
      line2 = r.path('M' + x1 + ' ' + footer_line + 'L' + x2 + ' ' + footer_line);
      backgroundline.push(line2);
      year = start;
      while (year <= end) {
        x = Math.floor(opt.x_interval * (year - base_start));
        line1 = r.path('M' + x + ' 0L' + x + ' ' + footer_line);
        backgroundline.push(line1);
        txts.push(r.text(x, footer_line + 10, year).attr({
          stroke: '#000000',
          fill: '#000000'
        }));
        year += diff;
      }
      backgroundline.attr({
        'stroke': '#aaaaaa',
        'stroke-width': 0.5
      });
      i = 0;
      while (i < txts.length) {
        backgroundline.push(txts[i]);
        i++;
      }
      return bg = backgroundline;
    };
    Timeline.prototype.drawMove = function(v) {
      var i;
      i = 0;
      while (i < tls_imgs.length) {
        tls_imgs[i].translate(v, 0);
        i++;
      }
      return bg.translate(v, 0);
    };
    Timeline.prototype.draw = function() {
      var i, interval, tls_imgs, y, _results;
      tls_imgs = [];
      this.drawBackground();
      interval = opt.y_interval;
      y = interval;
      i = 0;
      _results = [];
      while (i < tls.length) {
        tls_imgs.push(this.drawTimeline(tls[i], y));
        y += interval;
        _results.push(i++);
      }
      return _results;
    };
    Timeline.prototype.clear = function() {
      return r.clear();
    };
    Timeline.prototype.redraw = function() {
      this.clear();
      return this.draw();
    };
    Timeline.prototype.setNodeSize = function() {
      opt.nodeRadius = v;
      return this.redraw();
    };
    Timeline.prototype.setViewArea = function(v_start, v_end) {
      var end, start;
      start = parseInt(v_start, 10);
      end = parseInt(v_end, 10);
      opt.start = start;
      opt.end = end;
      this.setRange(end - start);
      return this.redraw();
    };
    Timeline.prototype.setMove = function(moveDate) {
      moveDate = parseInt(moveDate, 10);
      if ((moveDate > 0 && opt.start - moveDate >= opt.date_min) || (moveDate < 0 && opt.end - moveDate <= opt.date_max)) {
        opt.start = opt.start - moveDate;
        opt.end = opt.end - moveDate;
        this.drawMove(opt.x_interval * moveDate);
        return true;
      }
      return false;
    };
    Timeline.prototype.setRange = function(v_range) {
      var x_interval;
      opt.range = v_range;
      if (v_range <= 0) {
        return;
      }
      x_interval = opt.width / v_range;
      if (x_interval > 0) {
        return opt.x_interval = x_interval;
      }
    };
    Timeline.prototype.setStart = function(v) {
      return this.setViewArea(v, opt.end);
    };
    Timeline.prototype.setEnd = function(v) {
      return this.setViewArea(opt.start, v);
    };
    Timeline.prototype.getStart = function() {
      return opt.start;
    };
    Timeline.prototype.getEnd = function() {
      return opt.end;
    };
    Timeline.prototype.readJSON = function(v) {
      var tls;
      tls = v;
      return this.redraw();
    };
    return Timeline;
  })();
}).call(this);
