function Timeline(raphael, options, timelines) {
    var r, opt, tls, tls_imgs, bg;
    r = raphael;
    opt = options;
    tls = timelines;
    tls_imgs = [];
    bg = null;

    this.drawNode = function (x1, y1, c1, info) {
        var c, rect, txt, radius, impact;
        impact = parseInt(info.impact, 10);
        if (impact === null) {
            impact = 1;
        }
        radius = Math.floor(opt.nodeRadius * impact);
        c = r.circle(x1, y1, radius);
        txt = r.text(x1, y1 + 20, info.time + ' ' + info.label);

        txt.hide();
        c.node.onmouseover = function () {
            c.toFront();
            txt.toFront();
            txt.attr(
                {
                    "stroke": '#000000',
                    "fill": '#000000',
                    "stroke-width": 1,
                    "text-anchor": "start",
                    "font-size": 12
                }
            );
            txt.show();
        };
        c.node.onmouseout = function () {
            txt.hide();
        };
        return [c, txt];
    };
    this.drawPath = function (tl, x1, x2, y, c1, c2) {
        var line1, interval, start, tmp_node;
        interval = opt.x_interval;
        start = opt.start;
        line1 = r.path('M' + (interval * (x1 - start)) + ' ' + y
                       + 'L' + (interval * (x2 - start)) + ' ' + y);
        tl.push(line1);
    };
    this.drawPeriod = function (period, y, c1, c2) {
        return this.drawNode(
            opt.x_interval * (period.time - opt.start),
            y,
            c1,
            period
        );
    };
    this.drawTimeline = function (timeline, y) {
        var c1, j, periods, tl, tl_start, tl_end, tmp_node;

        tl = r.set();
        if (timeline.is_visible) {
            tl_start = opt.date_min;
            tl_end = opt.date_max;

            c1 = timeline.color;
            this.drawPath(
                tl,
                Math.max(tl_start, timeline.t_start),
                Math.min(tl_end, timeline.t_end),
                y,
                c1
            );
            periods = timeline.periods;
            for (j = 0; j < periods.length; j += 1) {
                tmp_node = this.drawPeriod(periods[j], y, c1);
                tl.push(tmp_node[0]);
                tl.push(tmp_node[1]);
            }
            tl.attr(
                {
                    "fill": opt.bgcolor,
                    "stroke": c1,
                    "stroke-width": 4
                }
            );

            r.text(
                20,
                y - 20,
                timeline.title + ' (' + timeline.t_start + ' 〜 ' + timeline.t_end + ')'
            )
                .attr(
                    {
                        "stroke": '#000000',
                        "fill": '#000000',
                        "text-anchor": "start",
                        "font-size": 12
                    }
                );
        }
        return tl;
    };
    this.drawBackground = function () {
        var x, backgroundline, w, h, footer_line, start, end, year, diff, line1, line2, txt, date_min, date_max, txts, i, x1, x2, base_start;
        w = opt.width;
        h = opt.height;
        footer_line = h - 40;
        backgroundline = r.set();
        txts = [];

        // start = opt.start;
        // end = opt.end;
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
        for (year = start; year <= end; year += diff) {
            x = Math.floor(opt.x_interval * (year - base_start));
            line1 = r.path('M' + x + ' 0L' + x + ' ' + footer_line);
            backgroundline.push(line1);
            txts.push(r.text(x, footer_line + 10, year)
                      .attr({stroke: '#000000', fill: '#000000'}));
        }
        backgroundline.attr({'stroke': '#aaaaaa', 'stroke-width': 0.5});

        for (i = 0; i < txts.length; i += 1) {
            backgroundline.push(txts[i]);
        }
        bg = backgroundline;
    };
    this.drawMove = function (v) {
        var i;
        for (i = 0; i < tls_imgs.length; i += 1) {
            tls_imgs[i].translate(v, 0);
        }
	bg.translate(v, 0);
    };
    this.draw = function () {
        var i, y, interval;
        tls_imgs = [];
        this.drawBackground();
        interval = opt.y_interval;
        y = interval;
        for (i = 0; i < tls.length; i += 1) {
            tls_imgs.push(this.drawTimeline(tls[i], y));
            y += interval;
        }
    };
    this.clear = function () {
        r.clear();
    };
    this.redraw = function () {
        this.clear();
        this.draw();
    };
    this.setNodeSize = function (v) {
        opt.nodeRadius = v;
        this.redraw();
    };
    this.setViewArea = function (v_start, v_end) {
        var range, start, end;
        start = parseInt(v_start, 10);
        end = parseInt(v_end, 10);
        opt.start = start;
        opt.end = end;
        this.setRange(end - start);
        this.redraw();
    };
    this.setMove = function (moveDate) {
        var start, end, setMoveSub;
        moveDate = parseInt(moveDate, 10);

        if ((moveDate > 0 && opt.start - moveDate >= opt.date_min) ||
            (moveDate < 0 && opt.end - moveDate <= opt.date_max)) {
            opt.start = opt.start - moveDate;
            opt.end = opt.end - moveDate;
            this.drawMove(opt.x_interval * moveDate);
        }
        return false;
    };
    this.setRange = function (v_range) {
        var range, x_interval;
        opt.range = v_range;
        if (v_range <= 0) {
            return;
        }
        x_interval = opt.width / v_range;
        if (x_interval > 0) {
            opt.x_interval = x_interval;
        }
    };
    this.setStart = function (v) {
        this.setViewArea(v, opt.end);
    };
    this.setEnd = function (v) {
        this.setViewArea(opt.start, v);
    };
    this.readJSON = function (v) {
        tls = v;
        this.redraw();
    };
}
