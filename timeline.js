function getNum(id) {
    return parseInt(document.getElementById(id).value, 10);
}

function setNum(id, value) {
    document.getElementById(id).value = parseInt(value, 10);
}

function TimeChart(raphael, options, timelines) {
    var r = raphael;
    var opt = options;
    var tls = timelines;
    var tls_imgs = [];
    var bg = null;

    this.drawNode = function (x1, y1, c1, info) {
	var c, rect, txt, radius, impact;
	impact = parseInt(info.impact, 10);
	if (impact == null) {	    
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
		    stroke: '#000000',
		    fill: '#000000',
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
	/*
	tmp_node = this.drawNode(
	    interval * (x1 - start),
	    y,
	    c1,
	    {time: x1, label: '開始'}
	);
	tl.push(tmp_node);
	tmp_node = this.drawNode(
	    interval * (x2 - start),
	    y,
	    c1,
	    {time: x2, label: '終了'}
	);
	tl.push(tmp_node);
	 */
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
		/*
		// 描画速度改善のため、余分なデータを描画しない
		if (tl_start <= periods[j].time && periods[j].time <= tl_end) {

		}
		 */
	    }
	    tl.attr(
		{
		    'fill': opt.bgcolor,
		    'stroke': c1,
		    'stroke-width': 4
		}
	    );
	    
	    r.text(
		20,
		y - 20,
		timeline.title + ' (' + timeline.t_start + ' 〜 ' + timeline.t_end + ')'
	    )
		.attr({
			  stroke: '#000000',
			  fill: '#000000',
			  "text-anchor": "start",
			  "font-size": 12
		      });
	}
	return tl;
    };
    this.drawBackground = function () {
	var x, backgroundline, w, h,
	footer_line, _start,
	_end, _year, _diff,
	line1, line2, txt,
	_date_min, _date_max,
	txts;
	w = opt.width;
	h = opt.height;
	footer_line = h - 40;
	backgroundline = r.set();
	txts = [];

	_start = opt.start;
	_end = opt.end;
	_year = _start;
	_diff = Math.floor((_end - _start) / 10);
	if (_diff == 0) {
	    _diff = 1;
	}


	line2 = r.path('M' + 0 + ' ' + footer_line + 'L' + w + ' ' + footer_line);
	backgroundline.push(line2);
	for (_year = _start; _year <= _end; _year += _diff) {
	    x = Math.floor(opt.x_interval * (_year - _start));
	    line1 = r.path('M' + x + ' ' + 0 + 'L' + x + ' ' + footer_line);
	    backgroundline.push(line1);
	    txts.push(r.text(x, footer_line + 10, _year)
		.attr({stroke: '#000000', fill: '#000000'}));
	}
	backgroundline.attr({'stroke': '#aaaaaa', 'stroke-width': 0.5});

	for (var i = 0; i < txts.length; i += 1) {
	    backgroundline.push(txts[i]);
	}
	bg = backgroundline;
    };
    this.drawMove = function (v) {
	var i;
	for (i = 0; i < tls_imgs.length; i += 1) {
	    tls_imgs[i].translate(v, 0);
	}
	bg.remove();
	this.drawBackground();
	bg.toBack();
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
	var range, _start, _end;
	_start = parseInt(v_start, 10);
	_end = parseInt(v_end, 10);
	opt.start = _start;
	opt.end = _end;
	this.setRange(_end - _start);
	this.redraw();
    };
    this.setMove = function (moveDate) {
	var _moveDate, _start, _end, setMoveSub;
	_moveDate = parseInt(moveDate, 10);

	if ((_moveDate > 0 && opt.start - _moveDate >= opt.date_min) ||
	    (_moveDate < 0 && opt.end - _moveDate <= opt.date_max)) {
    	    opt.start = opt.start - _moveDate;
	    opt.end = opt.end - _moveDate;
	    this.drawMove(opt.x_interval * _moveDate);
	    return true;

    	    opt.start = opt.start - _moveDate;
	    opt.end = opt.end - _moveDate;
	    this.drawMove(opt.x_interval * _moveDate);
	    return true;
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
   
window.onload = function () {
    var w, h, timelines, opt_timeline;
    
    timelines = jQuery.parseJSON(document.getElementById('timeline_data').value);
    opt_timeline = {
	"start": 1500,
	"end": 1650,
	"y_interval": 60,
	"bgcolor": "#ffffff",
	"nodeRadius": 2.0,
	"nodeRadiusDiff": 0.5,
	"width": 600,
	"height": 400,
	"date_min": 1500,
	"date_max": 1700
    };

    document.getElementById('tc_start').value = opt_timeline.start;
    document.getElementById('tc_end').value = opt_timeline.end;
    w = opt_timeline.width;
    h = opt_timeline.height;

    r = new Raphael("tc_timechart", w, h);
    tc = new TimeChart(r, 
		       opt_timeline,
		       timelines);
    tc.setRange(opt_timeline.end - opt_timeline.start);
    tc.draw(); 
    r.safari();
};

function setStart(v) {
    tc.setStart(v);
    setNum('tc_range_diff', getNum('tc_end') - getNum('tc_start'));
}

function setEnd(v) {
    tc.setEnd(v);
    setNum('tc_range_diff', getNum('tc_end') - getNum('tc_start'));    
}

function changeRange(v) {
    var v_start, range;
    v_start = getNum('tc_start');
    range = Number(v);
    setNum('tc_end', v_start + range);
    tc.setViewArea(v_start, v_start + range);
}

function setPrev() {
    var v, v_start, v_end;
    v = 10;
    if (tc.setMove(v)) {
	v_start = getNum('tc_start') - v;
	v_end = getNum('tc_end') - v;	
	
	setNum('tc_start', v_start);
	setNum('tc_end', v_end);
    }
}

function setNext() {
   var v, v_start, v_end;
    v = 10;
    if (tc.setMove(- v)) {
	v_start = getNum('tc_start') + v;
	v_end = getNum('tc_end') + v;	
	
	setNum('tc_start', v_start);
	setNum('tc_end', v_end);
    }
}

function readJSON() {
    var timelines = jQuery.parseJSON(document.getElementById('timeline_data').value);  
    tc.readJSON(timelines);
}

/*
// Dragで移動するための処理
isMouseDown = False;
mouseDownX = null;
mouseDownY = null;

function mouseDownOnTimechart(e) {
    isMouseDown = True;
    mouseDownX = window.event.clientX;
    mouseDownY = window.event.clientY;
}



function moveYearInit(e) {
    // 初期化する
    isMouseDown = False;
    mouseDownX = null;
    mouseDownY = null;
}
*/