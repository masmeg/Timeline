var changeRange, getNum, opt_timeline, readJSON, setEnd, setMoveRange, setNext, setNum, setPrev, setSlider, setSliderRange, setStart, tc, timelines;
getNum = function(id) {
  return parseInt(jQuery(id).val(), 10);
};
setNum = function(id, value) {
  return jQuery(id).val(parseInt(value, 10));
};
setSlider = function() {
  var rate, y_end, y_start, year_length;
  year_length = opt_timeline.date_max - opt_timeline.date_min;
  rate = opt_timeline.width / year_length;
  y_start = tc.getStart();
  y_end = tc.getEnd();
  $('#slider_front').width((y_end - y_start) * rate);
  $('#slider_front').css('left', (y_start - opt_timeline.date_min) * rate);
};
setSliderRange = function() {
  if (getNum('#tc_end') - getNum('#tc_start') > 0) {
    setNum('#tc_range_diff', getNum('#tc_end') - getNum('#tc_start'));
    setSlider();
  }
};
setStart = function(v) {
  tc.setStart(v);
  setSliderRange();
};
setEnd = function(v) {
  tc.setEnd(v);
  setSliderRange();
};
changeRange = function(v) {
  var range, v_start;
  v_start = getNum('#tc_start');
  range = Number(v);
  setNum('#tc_end', v_start + range);
  tc.setViewArea(v_start, v_start + range);
  setSlider();
};
setMoveRange = function(v) {
  if (tc.setMove(v)) {
    setNum('#tc_start', tc.getStart());
    setNum('#tc_end', tc.getEnd());
  }
  setSlider();
};
setPrev = function() {
  setMoveRange(10);
};
setNext = function() {
  setMoveRange(-10);
};
readJSON = function() {
  var timelines;
  timelines = jQuery.parseJSON(jQuery('#timeline_data').val());
  tc.readJSON(timelines);
};
tc = {};
opt_timeline = {};
timelines = {};
window.onload = function() {
  var h, r, w;
  timelines = jQuery.parseJSON(jQuery('#timeline_data').val());
  opt_timeline = {
    start: 1500,
    end: 1650,
    y_interval: 60,
    bgcolor: "#ffffff",
    nodeRadius: 2.0,
    nodeRadiusDiff: 0.5,
    width: 600,
    height: 400,
    date_min: 1500,
    date_max: 1700
  };
  jQuery('#tc_start').val(opt_timeline.start);
  jQuery('#tc_end').val(opt_timeline.end);
  w = opt_timeline.width;
  h = opt_timeline.height;
  r = new Raphael("tc_timechart", w, h);
  tc = new Timeline(r, opt_timeline, timelines);
  tc.setRange(opt_timeline.end - opt_timeline.start);
  tc.draw();
  return r.safari();
};