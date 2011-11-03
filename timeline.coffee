class Timeline
        constructor: (raphael, options, timelines) ->
                @r = raphael;
                @opt = options;
                @tls = timelines;
                @tls_imgs = [];
                @bg = null;

        drawNode: (x1, y1, c1, info) ->
                impact = parseInt(info.impact, 10);
                if impact?
                        impact = 1;

                radius = Math.floor(opt.nodeRadius * impact);
                c = r.circle(x1, y1, radius);
                txt = r.text(x1, y1 + 20, info.time + ' ' + info.label);

                txt.hide();
                c.node.onmouseover ->
                        c.toFront();
                        txt.toFront();
                        txt.attr
                                "stroke": '#000000',
                                "fill": '#000000',
                                "stroke-width": 1,
                                "text-anchor": "start",
                                "font-size": 12
                txt.show();
                c.node.onmouseout ->
                        txt.hide();
                return [c, txt];

        drawPath: (tl, x1, x2, y, c1, c2) ->
                interval = opt.x_interval;
                start = opt.start;
                line1 = r.path('M' + (interval * (x1 - start)) + ' ' + y
                        + 'L' + (interval * (x2 - start)) + ' ' + y);
                tl.push(line1);
        drawPeriod: (period, y, c1, c2) ->
                this.drawNode(
                        opt.x_interval * (period.time - opt.start),
                        y,
                        c1,
                        period)
        drawTimeline: (timeline, y) ->
                tl = r.set();
                if timeline.is_visible
                        tl_start = opt.date_min;
                        tl_end = opt.date_max;

                c1 = timeline.color;
                this.drawPath(
                        tl,
                        Math.max(tl_start, timeline.t_start),
                        Math.min(tl_end, timeline.t_end),
                        y,
                        c1)
                periods = timeline.periods;
                for period in periods
                        tmp_node = this.drawPeriod(period, y, c1);
                        tl.push(tmp_node[0]);
                        tl.push(tmp_node[1]);
                tl.attr(
                        "fill": opt.bgcolor,
                        "stroke": c1,
                        "stroke-width": 4)
                r.text(
                        20,
                        y - 20,
                        timeline.title + ' (' + timeline.t_start + ' 〜 ' + timeline.t_end + ')')
                .attr(
                        "stroke": '#000000',
                        "fill": '#000000',
                        "text-anchor": "start",
                        "font-size": 12)
                return tl;
        drawBackground: ->
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
                if diff is 0
                        diff = 1

                x1 = Math.floor(opt.x_interval * (start - base_start));
                x2 = Math.floor(opt.x_interval * (end - base_start));
                line2 = r.path('M' + x1 + ' ' + footer_line + 'L' + x2 + ' ' + footer_line);
                backgroundline.push(line2);
                year = start
                while year <= end
                        x = Math.floor(opt.x_interval * (year - base_start));
                        line1 = r.path('M' + x + ' 0L' + x + ' ' + footer_line);
                        backgroundline.push(line1);
                        txts.push(r.text(x, footer_line + 10, year)
                                .attr({stroke: '#000000', fill: '#000000'}));
                        year += diff
                backgroundline.attr({'stroke': '#aaaaaa', 'stroke-width': 0.5});
                i = 0
                while i < txts.length
                        backgroundline.push(txts[i]);
                        i++
                bg = backgroundline;
        drawMove: (v) ->
                i = 0
                while i < tls_imgs.length
                        tls_imgs[i].translate(v, 0);
                        i++
                bg.translate(v, 0);
        draw: ->
                tls_imgs = [];
                this.drawBackground();
                interval = opt.y_interval;
                y = interval;
                i = 0
                while i < tls.length
                        tls_imgs.push(this.drawTimeline(tls[i], y));
                        y += interval;
                        i++;
        clear: ->
                r.clear();
        redraw: ->
                this.clear();
                this.draw();
        setNodeSize: ->
                opt.nodeRadius = v;
                this.redraw();
        setViewArea: (v_start, v_end) ->
                start = parseInt(v_start, 10);
                end = parseInt(v_end, 10);
                opt.start = start;
                opt.end = end;
                this.setRange(end - start);
                this.redraw();
        setMove: (moveDate) ->
                moveDate = parseInt(moveDate, 10);

                if ((moveDate > 0 and opt.start - moveDate >= opt.date_min) or (moveDate < 0 and opt.end - moveDate <= opt.date_max))
                        opt.start = opt.start - moveDate;
                        opt.end = opt.end - moveDate;
                        this.drawMove(opt.x_interval * moveDate);
                        return true;
                return false;
        setRange: (v_range) ->
                opt.range = v_range;
                if (v_range <= 0)
                        return;
                x_interval = opt.width / v_range;
                if (x_interval > 0)
                        opt.x_interval = x_interval;
        setStart: (v) ->
                this.setViewArea(v, opt.end);
        setEnd: (v) ->
                this.setViewArea(opt.start, v);
        getStart: ->
        	opt.start;
        getEnd: ->
                opt.end;
        readJSON: (v) ->
                tls = v;
                this.redraw();
