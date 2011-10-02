var tc, r;

function getNum(id) {
    return parseInt(jQuery(id).val(), 10);
}

function setNum(id, value) {
    jQuery(id).val(parseInt(value, 10));
}

window.onload = function () {
    var w, h, timelines, opt_timeline;

    timelines = jQuery.parseJSON(jQuery('#timeline_data').val());
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

    jQuery('#tc_start').val(opt_timeline.start);
    jQuery('#tc_end').val(opt_timeline.end);
    w = opt_timeline.width;
    h = opt_timeline.height;

    r = new Raphael("tc_timechart", w, h);
    tc = new Timeline(r,
                       opt_timeline,
                       timelines);
    tc.setRange(opt_timeline.end - opt_timeline.start);
    tc.draw();
    r.safari();
};

function setStart(v) {
    tc.setStart(v);
    setNum('#tc_range_diff', getNum('#tc_end') - getNum('#tc_start'));
}

function setEnd(v) {
    tc.setEnd(v);
    setNum('#tc_range_diff', getNum('#tc_end') - getNum('#tc_start'));
}

function changeRange(v) {
    var v_start, range;
    v_start = getNum('#tc_start');
    range = Number(v);
    setNum('#tc_end', v_start + range);
    tc.setViewArea(v_start, v_start + range);
}

function setPrev() {
    var v, v_start, v_end;
    v = 10;
    if (tc.setMove(v)) {
        v_start = getNum('#tc_start') - v;
        v_end = getNum('#tc_end') - v;

        setNum('#tc_start', v_start);
        setNum('#tc_end', v_end);
    }
}

function setNext() {
    var v, v_start, v_end;
    v = 10;
    if (tc.setMove(- v)) {
        v_start = getNum('#tc_start') + v;
        v_end = getNum('#tc_end') + v;

        setNum('#tc_start', v_start);
        setNum('#tc_end', v_end);
    }
}

function readJSON() {
    var timelines = jQuery.parseJSON(jQuery('#timeline_data').val());
    tc.readJSON(timelines);
}
