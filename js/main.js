/*
 Arduboy Web-based bitmap editor

 Copyright (c) 2016 emutyworks

 Released under the MIT license"
 http://opensource.org/licenses/mit-license.php
*/
var MAX_PIXEL_Y = 16;
var MAX_PIXEL_X = 16;
var PIXEL_SIZE = 16;
var PRE_PIXEL_SIZE = 2;
var CLIP_PIXEL_SIZE = 4;

var EDITER_LINE = "#808080";
var EDITER_GUIDE = "#e0e080";
var EDITER_CUR = "#ff0000";
var EDITER_W = "#ffffff";
var EDITER_B = "#000000";
var EDITER_MENU_SIZE = 45;
var EDITER_MENU_Y = PRE_PIXEL_SIZE * MAX_PIXEL_Y;
var EDITER_MAIN_Y = EDITER_MENU_Y + EDITER_MENU_SIZE;
var EDITER_PRE_X = 1;
var EDITER_PRE_Y = 1;
var EDITER_MAX_X = (8 * 128) + 1 + 270;
var EDITER_MAX_Y = (PRE_PIXEL_SIZE * 64) + EDITER_MENU_SIZE + (8 * 64);

var CLIP_MAX_X = 8;
var CLIP_MAX_Y = 16;
var CLIP_X = null;
var CLIP_Y = null;

var d = new Array();
var p = new Array();
var area_d = new Array();
var clip_d = new Array();
var edit_clip = new Array();
var clipboard = new Array();
var set_w = null;
var set_b = null;
var get_dy = null;
var hx_str = '';
var editer = null;
var ctx = null;
var cur_info = new Array();
var edit_alert = true;

init_edit_data();

/*
 * main 
 */
window.onload = function(){
  editer = document.getElementById('editer');
  ctx = editer.getContext('2d');

  init_editer();
  //init_clip();

  $('#memo').attr({
    value: 'New Character',
    size: '50',
  });

/*
  $(window).on('beforeunload', function() {
      return "Do you want to reload this site? Changes mane may not be saved.";
  });
*/
  /* canvas mouse event */
  function onMouseClick(e){
    mousePos(e);
/*
    if(check_clip_area()){
      if(event.shiftKey){
        select_clip_d();
      }else{

      }
    }
*/
    if(check_edit_area()){
      if(event.shiftKey){
        select_area_d();
      }else{
        change_bw();
      }
    }
  }

  function onMouseMove(e){
    mousePos(e);
    view_edit_info();
  }

  editer.addEventListener('click', onMouseClick, false);
  editer.addEventListener('mousemove', onMouseMove, false);

  function mousePos(e){
    var rect = e.target.getBoundingClientRect();
    var org_x = e.clientX - rect.left;
    var org_y = e.clientY - rect.top;
    var x = org_x;
    var y = org_y - EDITER_MAIN_Y;

    var dx = parseInt(x / PIXEL_SIZE);
    var dy = parseInt(y / PIXEL_SIZE);

    cur_info = {
      org_x: org_x,
      org_y: org_y,
      x: x,
      y: y,
      dx: dx,
      dy: dy,
    }
  }

  /* data upload */
  var file = document.querySelector('#data_upload');
  file.onchange = function(){
    var fileList = file.files;
    var reader = new FileReader();
    reader.readAsText(fileList[0]);

    reader.onload = function(){
      var up_text = reader.result;
    　 var up_array = up_text.split("\n");

      var up_d = new Array();
      var img = '';
      for(var i=0; i < up_array.length; i++){
        var row = up_array[i];

        if(row.charAt(0) == '#'){
          if(row.indexOf(':')){
            var comment = row.split("]");
            var key = comment[0].substr(comment[0].indexOf('[')+1).trim();
            up_d[key] = comment[1].trim();
          }
        }else if(row.charAt(0) == '0'){
          img += row.replace(/\s+/g, "");
        }
      }

      var pixel = up_d['Pixel'].split('x');
      change_edit_pixel(pixel[0],pixel[1]);
      
      $('#memo').attr('value', up_d['Memo']);
    
      d = img.split(',');
      set_data();

      console.log(up_d);
    };

    if(!String.prototype.trim){
      String.prototype.trim = function(){
        return this.replace(/^\s+|\s+$/g,'');
      };
    }
  };
}

function select_area_d(){
  var dx = cur_info['dx'];
  var dy = cur_info['dy'];
  var x = parseInt(dx / 8);
  var y = parseInt(dy / 8);

  if(!is_area_d()){
    area_d['x'] = parseInt(dx / 8);
    area_d['y'] = parseInt(dy / 8);

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = EDITER_CUR;
    ctx.fillRect(x * PIXEL_SIZE * 8, (y * PIXEL_SIZE * 8) + EDITER_MAIN_Y,  PIXEL_SIZE * 8 + 1, PIXEL_SIZE * 8 + 1);
    ctx.globalAlpha = 1.0;
  }else if(area_d['x'] == x && area_d['y'] == y){
    redraw_editer();
  }
}

function is_area_d(){
  if(area_d['x'] != null && area_d['y'] != null){
    return true;
  }else{
    return false;
  }
}

/*
 * edit
 */
function edit_counter_clockwize(){
  var mes = 'counter clockwize';
  var flag = edit_confirm(mes);
  var pos = get_area_d_pos();
  var clip = d.slice(pos, pos + 8);

  if(flag){
    var b = new Array();

    for(var i = 0; i < 8; i++){
      b[i] = cnv16to2(clip[i]);
    }

    var cnt = 0;
    for(var i = 7; i >= 0; i--){

      var cb = '';
      for(var j = 0; j < 8; j++){
        cb += b[j].charAt(i);
      }
      clip[cnt] = cnv2to16(cb);
      cnt++;
    }

    for(var i = 0; i < 8; i++){
      d[i + pos] = clip[i];
    }
  }

  redraw_editer();
}

function edit_clockwize(){
  var mes = 'clockwize';
  var flag = edit_confirm(mes);
  var pos = get_area_d_pos();
  var clip = d.slice(pos, pos + 8);

  if(flag){
    var b = new Array();

    for(var i = 0; i < 8; i++){
      b[i] = cnv16to2(clip[i]);
    }

    var cnt = 0;
    for(var i = 0; i < 8; i++){
      var cb = '';
      for(var j = 7; j >= 0; j--){
        cb += b[j].charAt(i);
      }
      clip[cnt] = cnv2to16(cb);
      cnt++;
    }
    for(var i = 0; i < 8; i++){
      d[i + pos] = clip[i];
    }
  }

  redraw_editer();
}

function edit_half_turn(){
  var mes = 'half turn';
  var flag = edit_confirm(mes);
  var pos = get_area_d_pos();
  var clip = d.slice(pos, pos + 8);

  if(flag){
    var j = 7;
    clip = horisonal_area(clip);
    for(var i = 0; i < 8; i++){
      d[i + pos] = clip[j];
      j--;
    }
  }

  redraw_editer();
}

function edit_vertical(){
  var mes = 'vertical';
  var flag = edit_confirm(mes);
  var pos = get_area_d_pos();
  var clip = d.slice(pos, pos + 8);

  if(flag){
    var j = 7;
    for(var i = 0; i < 8; i++){
      d[i + pos] = clip[j];
      j--;
    }
  }

  redraw_editer();
}

function edit_horisonal(){
  var mes = 'horisonal';
  var flag = edit_confirm(mes);
  var pos = get_area_d_pos();
  var clip = d.slice(pos, pos + 8);

  if(flag){
    clip = horisonal_area(clip);
    for(var i = 0; i < 8; i++){
      d[i + pos] = clip[i];
    }
  }

  redraw_editer();
}

function horisonal_area(clip){
  for(var i = 0; i < 8; i++){
    var b = cnv16to2(clip[i]);
    var hb = '';

    for(var j = 7; j >= 0; j--){
      hb += b.charAt(j);
    }
    clip[i] = cnv2to16(hb);
  }
  return clip;
}

function edit_paste(){
  var mes = 'paste';
  var flag = edit_confirm(mes);

  if(flag){
    var pos = get_area_d_pos();

    for(var i = 0; i < 8; i++){
      d[i + pos] = edit_clip[i];
    }
  }
 
  redraw_editer();
}

function edit_copy(){
  var mes = 'copy';

  if(!is_area_d()){
    unselected_area_alert(mes);
    return false;
  }

  var pos = get_area_d_pos();
  edit_clip = d.slice(pos, pos + 8);

  redraw_editer();
}

function edit_cut(){
  var mes = 'cut';
  var flag = edit_confirm(mes);

  if(flag){
    var pos = get_area_d_pos();

    edit_clip = d.slice(pos, pos + 8);
    for(var i = 0; i < 8; i++){
      d[i + pos] = '0x00';
    }
  }

  redraw_editer();
}

function edit_confirm(mes){
  if(!is_area_d()){
    unselected_area_alert(mes);
    return false;
  }

  var flag = true;
  if(edit_alert){
    flag = edit_confirm_alert(mes);
  }

  return flag;
}

function edit_confirm_alert(mes){
  return window.confirm('Do you ' + mes + ' it?');
}

function unselected_area_alert(mes){
  alert('Please select a ' + mes + ' area (SHIFT + Mouse click)');
}

function set_edit_alert(){
  if($('#edit_alert').prop('checked')){
    edit_alert = false;
  }else{
    edit_alert = true;
  }
}

function get_area_d_pos(){
  var x = area_d['x'];
  var y = area_d['y'];
  return x * 8 + MAX_PIXEL_X * y;
}

/*
 * clipboard
 */
function redraw_clip(){
  init_clip();
  init_clip_d();
}

function init_clip_d(){
  clip_d = {
    x: null,
    y: null,
  };
}

function select_clip_d(){
  var x = cur_info['x'];
  var y = cur_info['y'];
  var cx = parseInt((x - CLIP_X) / (CLIP_PIXEL_SIZE * 8));
  var cy = parseInt(y / (CLIP_PIXEL_SIZE * 8));

  if(!is_clip_d()){
    clip_d['x']  = cx;
    clip_d['y']  = cy;

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = EDITER_CUR;
    ctx.fillRect(CLIP_X + (cx * CLIP_PIXEL_SIZE * 8), CLIP_Y + (cy * CLIP_PIXEL_SIZE * 8), CLIP_PIXEL_SIZE * 8 + 1, CLIP_PIXEL_SIZE * 8 + 1);
    ctx.globalAlpha = 1.0;
  }else if(clip_d['x'] == cx && clip_d['y'] == cy){
    redraw_clip();
  }
}

function is_clip_d(){
  if(clip_d['x'] != null && clip_d['y'] != null){
    return true;
  }else{
    return false;
  }
}

function check_clip_area(){
  var max_x = CLIP_PIXEL_SIZE * CLIP_MAX_X * 8;
  var max_y = CLIP_PIXEL_SIZE * CLIP_MAX_Y * 8;
  var x = cur_info['x'];
  var y = cur_info['y'];

  if(y >= 0 && x > CLIP_X && x < CLIP_X + max_x && y < max_y){
    return true;
  }
  return false;
}

function init_clip(){
  var max_x = CLIP_PIXEL_SIZE * CLIP_MAX_X * 8;
  var max_y = CLIP_PIXEL_SIZE * CLIP_MAX_Y * 8;

  CLIP_X = PIXEL_SIZE * MAX_PIXEL_X + 10;
  CLIP_Y = EDITER_MAIN_Y;

  ctx.fillStyle = EDITER_B;
  ctx.fillRect(CLIP_X, CLIP_Y, max_x, max_y);

  init_clip_guide();
}

function init_clip_guide(){
  var max_x = CLIP_PIXEL_SIZE * CLIP_MAX_X * 8;
  var max_y = CLIP_PIXEL_SIZE * CLIP_MAX_Y * 8;

  ctx.fillStyle = EDITER_LINE;
  for(var i = 0; i < CLIP_MAX_X; i++){
    ctx.fillRect(CLIP_X + (i * CLIP_PIXEL_SIZE *8), CLIP_Y, 1, max_y);
  }

  for(var i = 0; i < CLIP_MAX_Y; i++){
    ctx.fillRect(CLIP_X, CLIP_Y + (i * CLIP_PIXEL_SIZE *8), max_x, 1);
  }

  ctx.strokeStyle = EDITER_LINE;
  ctx.strokeRect(CLIP_X, CLIP_Y, max_x, max_y);
}

function init_clip_data(){
  var max_d = CLIP_MAX_X * 8 * CLIP_MAX_Y;
  clipboard = new Array(max_d);

  for(var i = 0; i < max_d; i++){
    clipboard[i] = '0x00';
  } 
}

/*
 * editer
 */
function redraw_editer(){
  init_editer();
  set_data();
  init_area_d();

  //init_clip();
  //init_clip_d();
}

function check_edit_area(){
  var y = cur_info['y'];
  var dx = cur_info['dx'];
  var dy = cur_info['dy'];

  if(y >= 0 && dx < MAX_PIXEL_X && dy < MAX_PIXEL_Y){
    return true;
  }
  return false;
}

function view_edit_info(){
 if(check_edit_area()){
    var dx = ('000' + cur_info['dx']).slice(-3);
    var dy = ('000' + cur_info['dy']).slice(-3);

    $('#edit_info').html('x:' + dx +' y:' + dy);
  }
}

function change_edit_pixel(x,y){
  if(window.confirm('Data will be reset. Is it OK?')){
    MAX_PIXEL_X = x;
    MAX_PIXEL_Y = y;

    EDITER_MAX_Y = (PRE_PIXEL_SIZE * 64) + EDITER_MENU_SIZE + (8 * 64);

    if(MAX_PIXEL_X==128){
      PIXEL_SIZE = 8;
    }else if(MAX_PIXEL_Y==8){
      PIXEL_SIZE = 16;
    }else if(MAX_PIXEL_Y==16){
      PIXEL_SIZE = 16;
    }else if(MAX_PIXEL_Y==32){
      PIXEL_SIZE = 14;
    }else if(MAX_PIXEL_Y==64){
      PIXEL_SIZE = 10;
      EDITER_MAX_Y = (PRE_PIXEL_SIZE * MAX_PIXEL_Y) + EDITER_MENU_SIZE + (PIXEL_SIZE * MAX_PIXEL_Y);
    }
    EDITER_MENU_Y = PRE_PIXEL_SIZE * MAX_PIXEL_Y;
    EDITER_MAIN_Y = EDITER_MENU_Y + EDITER_MENU_SIZE;

    init_edit_data();
    init_editer();

    //init_clip();
  }
}

function init_editer(){
  var max_x = PIXEL_SIZE * MAX_PIXEL_X;
  var max_y = PIXEL_SIZE * MAX_PIXEL_Y;

  view_edit_info();

  $('#editer').attr({
    width: EDITER_MAX_X,
    height: EDITER_MAX_Y,
  });

  /* preview */
  ctx.fillStyle = EDITER_B;
  ctx.fillRect(EDITER_PRE_X, EDITER_PRE_Y, PRE_PIXEL_SIZE * MAX_PIXEL_X, PRE_PIXEL_SIZE * MAX_PIXEL_Y);

  ctx.strokeStyle = EDITER_LINE;
  ctx.strokeRect(EDITER_PRE_X, EDITER_PRE_Y, PRE_PIXEL_SIZE * MAX_PIXEL_X, PRE_PIXEL_SIZE * MAX_PIXEL_Y);

  /* editer main */
  ctx.fillStyle = EDITER_B;
  ctx.fillRect(0, EDITER_MAIN_Y, max_x, max_y);

  init_editer_guide();

  $('#edit_menu').css({
    position: 'relative',
    top: EDITER_MAIN_Y - 30,
  });

  /* outer frame */
  //ctx.strokeStyle = EDITER_B;
  //ctx.strokeRect(0,0,EDITER_MAX_X,EDITER_MAX_Y);
}

function init_editer_guide(){
  var max_x = PIXEL_SIZE * MAX_PIXEL_X;
  var max_y = PIXEL_SIZE * MAX_PIXEL_Y;

  for(var i = 0; i < MAX_PIXEL_X; i++){
    if((i % 8)==0){
      ctx.fillStyle = EDITER_GUIDE;
    }else{
      ctx.fillStyle = EDITER_LINE;
  
    }
    ctx.fillRect(PIXEL_SIZE * i, EDITER_MAIN_Y, 1, max_y);
  }

  for(var i = 0; i < MAX_PIXEL_Y; i++){
    if((i % 8)==0){
      ctx.fillStyle = EDITER_GUIDE;
    }else{
      ctx.fillStyle = EDITER_LINE;      
    }
    ctx.fillRect(0, PIXEL_SIZE * i + EDITER_MAIN_Y, max_x, 1);
  }

  ctx.strokeStyle = EDITER_LINE;
  ctx.strokeRect(0, EDITER_MAIN_Y, max_x, max_y);
}

function change_bw(){
  if(check_edit_area()){
    var dx = cur_info['dx'];
    var dy = cur_info['dy'];
    var bw = get_d(dx,dy);
    
    if(bw == 1){
      set_bw(dx,dy,0);
    }else{
      set_bw(dx,dy,1);
    }
  }
}

function set_bw(dx,dy,bw){
  var x = dx + parseInt(dy / 8) * MAX_PIXEL_X;
  var y = dy % 8;

  if(bw==1){
    d[x] = '0x' + ('00' + parseInt((d[x] | set_w[y]),10).toString(16)).slice(-2);
    ctx.fillStyle = EDITER_W;

  }else{
    d[x] = '0x' + ('00' + parseInt((d[x] & set_b[y]),10).toString(16)).slice(-2);
    ctx.fillStyle = EDITER_B;
  
  }
  ctx.fillRect(dx * PIXEL_SIZE + 1, (dy * PIXEL_SIZE + 1) + EDITER_MAIN_Y, PIXEL_SIZE - 1, PIXEL_SIZE - 1);
  ctx.fillRect(dx * PRE_PIXEL_SIZE + EDITER_PRE_X , dy * PRE_PIXEL_SIZE + EDITER_PRE_Y, PRE_PIXEL_SIZE, PRE_PIXEL_SIZE);

  hx_str = '';
  set_hx_str(); 
  dev_log();

  $('#hx').val(hx_str);
}

function set_hx_str(){
  hx_str = '';
  if(MAX_PIXEL_X == 8 || MAX_PIXEL_X == 16){
    hx_str = d.join(', ');
  }else{
    for(var i = 0; i < (MAX_PIXEL_X * MAX_PIXEL_Y / 8 / 16); i++){
      var dx = i * 16;
      hx_str += 
        d[dx]+', '+d[dx+1]+', '+d[dx+2]+', '+d[dx+3]+', '+
        d[dx+4]+', '+d[dx+5]+', '+d[dx+6]+', '+d[dx+7]+', '+
        d[dx+8]+', '+d[dx+9]+', '+d[dx+10]+', '+d[dx+11]+', '+
        d[dx+12]+', '+d[dx+13]+', '+d[dx+14]+', '+d[dx+15]+",\n";
    }
  }
}

/*
 * data
 */
function get_d(dx,dy){
  var x = dx + parseInt(dy / 8) * MAX_PIXEL_X;
  var y = dy % 8;
  return cnv16to2(d[x]).charAt(get_dy[y]);
}

function set_data(){
  for(var dy = 0; dy < MAX_PIXEL_Y; dy++){
    for(var dx = 0; dx < MAX_PIXEL_X; dx++){
      set_bw(dx,dy,get_d(dx,dy));
    }
  }
}

function init_area_d(){
  area_d = {
    x: null,
    y: null,
  };
}

function init_edit_data(){
  var max_d = MAX_PIXEL_X * MAX_PIXEL_Y / 8;
  d = new Array(max_d);

  for(var i = 0; i < max_d; i++){
    d[i] = '0x00';
  }

  init_area_d();

  cur_info = {
    org_x: 0,
    org_y: 0,
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
  };

  set_w = [
    '0x01',//"00000001b"
    '0x02',//"00000010b"
    '0x04',//"00000100b"
    '0x08',//"00001000b"
    '0x10',//"00010000b"
    '0x20',//"00100000b"
    '0x40',//"01000000b"
    '0x80',//"10000000b"
  ];

  set_b = [
    '0xfe',//"11111110b"
    '0xfd',//"11111101b"
    '0xfb',//"11111011b"
    '0xf7',//"11110111b"
    '0xef',//"11101111b"
    '0xdf',//"11011111b"
    '0xbf',//"10111111b"
    '0x7f',//"01111111b"
  ];

  get_dy = [
    7,//"00000001b"
    6,//"00000010b"
    5,//"00000100b"
    4,//"00001000b"
    3,//"00010000b"
    2,//"00100000b"
    1,//"01000000b"
    0,//"10000000b"
  ];
}

/*
 * other
 */
function data_download(){
  var dt = new Date();
  var filename = $("#memo").val() + '.txt';
        
  $('#download').attr('download',filename);

  var content = '';
  content += '# [Create] ' + dt.toString() + "\n";
  content += '# [Pixel] ' + MAX_PIXEL_X + 'x' + MAX_PIXEL_Y + "\n";
  content += '# [Memo] ' + $("#memo").val() + "\n";
  content += hx_str;

  var blob = new Blob([ content ], { "type" : "text/plain" });
  
  if(window.navigator.msSaveBlob){
    window.navigator.msSaveBlob(blob, filename); 
  }else{
    document.getElementById("download").href = window.URL.createObjectURL(blob);
  }
}

function cnv16to2(hx){
  return ('00000000' + parseInt(hx,16).toString(2)).slice(-8);
}
function cnv2to16(b){
  return '0x' + ('00' + parseInt(b,2).toString(16)).slice(-2);
}

function dev_log(){
/*
  console.log('');
  for(var i = 0; i < (MAX_PIXEL_X * MAX_PIXEL_Y / 8); i++){
    console.log(i + ':' + ("00000000" + parseInt(d[i],16).toString(2)).slice(-8));
  }
*/
}

