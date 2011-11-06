class Timeline
        constructor: (raphael, options, timelines) ->
                @raph = raphael
                @opt = options
                @tls = timelines
                @tls_imgs = []
                @bg = null
        drawNode: (x1, y1, c1, info) ->
                impact = parseInt(info.impact, 10)
                impact = 1 if impact?
                radius = Math.floor(@opt.nodeRadius * impact)
                c = @raph.circle(x1, y1, radius)
                txt = @raph.text(x1, y1 + 20, info.time + ' ' + info.label)
                txt.hide()
                c.node.onmouseover = ->
                        c.toFront()
                        txt.toFront()
                        txt.attr(
                                "stroke": '#000000',
                                "fill": '#000000',
                                "stroke-width": 1,
                                "text-anchor": "start",
                                "font-size": 12)
                        txt.show()
                c.node.onmouseout = -> txt.hide()
                [c, txt]
        drawPath: (tl, x1, x2, y, c1, c2) ->
                interval = @opt.x_interval
                start = @opt.start
                px1 = (interval * (x1 - start))
                px2 = (interval * (x2 - start))
                line1 = @raph.path("M#{px1} #{y}L#{px2} #{y}")
                tl.push(line1)
                return
        drawPeriod: (period, y, c1, c2) ->
                @drawNode(
                        @opt.x_interval * (period.time - @opt.start),
                        y,
                        c1,
                        period)
        drawTimeline: (timeline, y) ->
                tl = @raph.set()
                if timeline.is_visible
                        tl_start = @opt.date_min
                        tl_end = @opt.date_max
                c1 = timeline.color
                @drawPath(
                        tl,
                        Math.max(tl_start, timeline.t_start),
                        Math.min(tl_end, timeline.t_end),
                        y,
                        c1)
                for period in timeline.periods
                        tmp_node = @drawPeriod(period, y, c1)
                        tl.push(tmp_node[0])
                        tl.push(tmp_node[1])
                tl.attr(
                        fill: @opt.bgcolor,
                        stroke: c1,
                        "stroke-width": 4)
                @raph.text(
                        20,
                        y - 20,
                        timeline.title + ' (' + timeline.t_start + ' 〜 ' + timeline.t_end + ')')
                .attr(
                        stroke: '#000000',
                        fill: '#000000',
                        "text-anchor": "start",
                        "font-size": 12)
                return tl
        drawBackground: ->
                w = @opt.width
                h = @opt.height
                footer_line = h - 40
                backgroundline = @raph.set()
                start = @opt.date_min
                end = @opt.date_max
                base_start = @opt.start
                year = start
                diff = Math.floor((@opt.end - @opt.start) / 10)
                diff = 1 if diff is 0
                x1 = Math.floor(@opt.x_interval * (start - base_start))
                x2 = Math.floor(@opt.x_interval * (end - base_start))
                line2 = @raph.path("M#{x1} #{footer_line}L#{x2} #{footer_line}")
                backgroundline.push(line2)
                year = start
                txts = []
                while year <= end
                        x = Math.floor(@opt.x_interval * (year - base_start))
                        line1 = @raph.path('M' + x + ' 0L' + x + ' ' + footer_line)
                        backgroundline.push(line1)
                        txts.push(@raph.text(x, footer_line + 10, year)
                                .attr({stroke: '#000000', fill: '#000000'}))
                        year += diff
                backgroundline.attr({'stroke': '#aaaaaa', 'stroke-width': 0.5})
                for txt in txts
                        backgroundline.push(txt)
                @bg = backgroundline
                return
        drawMove: (v) ->
                for tls_img in @tls_imgs
                        tls_img.translate(v, 0)
                @bg.translate(v, 0)
                return
        draw: ->
                @tls_imgs = []
                @drawBackground()
                interval = @opt.y_interval
                y = interval
                for tl in @tls
                        @tls_imgs.push(@drawTimeline(tl, y))
                        y += interval
                return
        clear: ->
                @raph.clear()
                return
        redraw: ->
                @clear()
                @draw()
                return
        setNodeSize: ->
                @opt.nodeRadius = v
                @redraw()
                return
        setViewArea: (v_start, v_end) ->
                start = parseInt(v_start, 10)
                end = parseInt(v_end, 10)
                @opt.start = start
                @opt.end = end
                @setRange(end - start)
                @redraw()
                return
        setMove: (moveDate) ->
                moveDate = parseInt(moveDate, 10)
                if ((moveDate > 0 and @opt.start - moveDate >= @opt.date_min) or (moveDate < 0 and @opt.end - moveDate <= @opt.date_max))
                        @opt.start = @opt.start - moveDate
                        @opt.end = @opt.end - moveDate
                        @drawMove(@opt.x_interval * moveDate)
                        return true
                return false
        setRange: (v_range) ->
                @opt.range = v_range
                return if v_range <= 0
                x_interval = @opt.width / v_range
                @opt.x_interval = x_interval if x_interval > 0
                return
        setStart: (v) -> @setViewArea(v, @opt.end)
        setEnd: (v) -> @setViewArea(@opt.start, v)
        getStart: -> @opt.start
        getEnd: -> @opt.end
        readJSON: (v) ->
                @tls = v
                @redraw()
                return
