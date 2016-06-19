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

var EDITOR_LINE = "#808080";
var EDITOR_GUIDE = "#e0e080";
var EDITOR_CUR = "#ff0000";
var EDITOR_W = "#ffffff";
var EDITOR_B = "#000000";
var EDITOR_MENU_SIZE = 45;
var EDITOR_MENU_Y = PRE_PIXEL_SIZE * MAX_PIXEL_Y;
var EDITOR_MAIN_Y = EDITOR_MENU_Y + EDITOR_MENU_SIZE;
var EDITOR_PRE_X = 0;
var EDITOR_PRE_Y = 0;
var EDITOR_MAX_X = (8 * 128) + 1 + 270;
var EDITOR_MAX_Y = (PRE_PIXEL_SIZE * 64) + EDITOR_MENU_SIZE + (8 * 64);

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
var editor = null;
var ctx = null;
var cursor = null;
var c_ctx = null;
var cur_info = new Array();
var edit_alert = true;

init_edit_data();
init_clip_data();

/*
 * clipboard
 */
function init_clip_d(){
  clip_d = {
    x: null,
    y: null,
  };
}

function init_clip(){
  var max_x = (CLIP_PIXEL_SIZE * 8 + 1) * CLIP_MAX_X + 1;
  var max_y = (CLIP_PIXEL_SIZE * 8 + 1) * CLIP_MAX_Y + 1;

  CLIP_X = PIXEL_SIZE * MAX_PIXEL_X + 10;
  CLIP_Y = EDITOR_MAIN_Y;

  ctx.fillStyle = EDITOR_B;
  ctx.fillRect(CLIP_X, CLIP_Y, max_x, max_y);

  init_clip_guide();
}

function init_clip_guide(){
  var max_x = (CLIP_PIXEL_SIZE * 8 + 1) * CLIP_MAX_X + 1;
  var max_y = (CLIP_PIXEL_SIZE * 8 + 1) * CLIP_MAX_Y + 1;

  ctx.fillStyle = EDITOR_LINE;

  for(var i = 1; i < CLIP_MAX_X + 1; i++){
    ctx.fillRect(CLIP_X + (i * CLIP_PIXEL_SIZE * 8) + i, CLIP_Y, 1, max_y);
  }

  for(var i = 1; i < CLIP_MAX_Y + 1; i++){
    ctx.fillRect(CLIP_X, CLIP_Y + (i * CLIP_PIXEL_SIZE * 8) + i, max_x, 1);
  }
  ctx.fillRect(CLIP_X, CLIP_Y, 1, max_y);
  ctx.fillRect(CLIP_X, CLIP_Y, max_x, 1);
}

function init_clip_data(){
  var max_d = CLIP_MAX_X * 8 * CLIP_MAX_Y;
  clipboard = new Array(max_d);

  for(var i = 0; i < max_d; i++){
    clipboard[i] = '0x00';
  } 

  init_clip_d();
}

/*
 * editor
 */
function init_area_d(){
  area_d = {
    x: null,
    y: null,
  };
}

function init_editor(){
  var max_x = PIXEL_SIZE * MAX_PIXEL_X;
  var max_y = PIXEL_SIZE * MAX_PIXEL_Y;
  var pre_max_x = PRE_PIXEL_SIZE * MAX_PIXEL_X;
  var pre_max_y = PRE_PIXEL_SIZE * MAX_PIXEL_Y;

  view_edit_info();

  if(area_d['x']!=null || area_d['y']!=null){
    var dx = area_d['x'] * 8;
    var dy = area_d['y'] * 8;

    /* preview */
    ctx.fillStyle = EDITOR_B;
    ctx.fillRect(dx * PRE_PIXEL_SIZE + 1, dy * PRE_PIXEL_SIZE + 1, PRE_PIXEL_SIZE * 8, PRE_PIXEL_SIZE * 8);

    ctx.fillStyle = EDITOR_LINE;
    ctx.fillRect(EDITOR_PRE_X, EDITOR_PRE_Y, pre_max_x + 2, 1);
    ctx.fillRect(EDITOR_PRE_X, EDITOR_PRE_Y, 1, pre_max_y + 2);
    ctx.fillRect(pre_max_x + 1, EDITOR_PRE_Y, 1, pre_max_y + 2);
    ctx.fillRect(EDITOR_PRE_X, pre_max_y + 1, pre_max_x + 2, 1);

    /* editor main */
    ctx.fillStyle = EDITOR_B;
    ctx.fillRect(dx * PIXEL_SIZE, dy * PIXEL_SIZE + EDITOR_MAIN_Y, PIXEL_SIZE * 8, PIXEL_SIZE * 8);

  }else{
    $('#editor').attr({
      width: EDITOR_MAX_X,
      height: EDITOR_MAX_Y,
    });

    $('#cursor').attr({
      width: EDITOR_MAX_X,
      height: EDITOR_MAX_Y,
    });

    /* preview */
    ctx.fillStyle = EDITOR_B;
    ctx.fillRect(EDITOR_PRE_X, EDITOR_PRE_Y, pre_max_x + 2, pre_max_y + 2);

    ctx.fillStyle = EDITOR_LINE;
    ctx.fillRect(EDITOR_PRE_X, EDITOR_PRE_Y, pre_max_x + 2, 1);
    ctx.fillRect(EDITOR_PRE_X, EDITOR_PRE_Y, 1, pre_max_y + 2);
    ctx.fillRect(pre_max_x + 1, EDITOR_PRE_Y, 1, pre_max_y + 2);
    ctx.fillRect(EDITOR_PRE_X, pre_max_y + 1, pre_max_x + 2, 1);

    /* editor main */
    ctx.fillStyle = EDITOR_B;
    ctx.fillRect(0, EDITOR_MAIN_Y, max_x, max_y);
  }
  
  init_editor_guide();

  $('#edit_menu').css({
    top: EDITOR_MAIN_Y - 40,
  });

  /* outer frame */
  //ctx.strokeStyle = EDITOR_B;
  //ctx.strokeRect(0,0,EDITOR_MAX_X,EDITOR_MAX_Y);
}

function init_editor_guide(){
  var max_x = PIXEL_SIZE * MAX_PIXEL_X;
  var max_y = PIXEL_SIZE * MAX_PIXEL_Y;

  if(area_d['x']!=null || area_d['y']!=null){
    var dx = area_d['x'] * 8;
    var dy = area_d['y'] * 8;

    ctx.fillStyle = EDITOR_LINE;    
    for(var i = dx; i < dx + 9; i++){
      ctx.fillRect(i * PIXEL_SIZE, EDITOR_MAIN_Y + (dy * PIXEL_SIZE), 1, PIXEL_SIZE * 8);
    }
    for(var i = dy; i < dy + 9; i++){
      ctx.fillRect(PIXEL_SIZE * dx, EDITOR_MAIN_Y + (i * PIXEL_SIZE), PIXEL_SIZE * 8, 1);
    }

    ctx.fillStyle = EDITOR_GUIDE;
    for(var i = dx; i < dx + 9; i += 8){
      ctx.fillRect(i * PIXEL_SIZE, EDITOR_MAIN_Y + (dy * PIXEL_SIZE), 1, PIXEL_SIZE * 8);
    }
    for(var i = dy; i < dy + 9; i += 8){
      ctx.fillRect(PIXEL_SIZE * dx, EDITOR_MAIN_Y + (i * PIXEL_SIZE), PIXEL_SIZE * 8 + 1, 1);
    }

  }else{
    ctx.fillStyle = EDITOR_LINE;
    for(var i = 0; i < MAX_PIXEL_X; i++){
      ctx.fillRect(PIXEL_SIZE * i, EDITOR_MAIN_Y, 1, max_y);
    }
    for(var i = 0; i < MAX_PIXEL_Y; i++){
      ctx.fillRect(0, PIXEL_SIZE * i + EDITOR_MAIN_Y, max_x, 1);
    }

    ctx.fillStyle = EDITOR_GUIDE;
    for(var i = 0; i < MAX_PIXEL_X; i += 8){
      ctx.fillRect(PIXEL_SIZE * i, EDITOR_MAIN_Y, 1, max_y);
    }
    for(var i = 0; i < MAX_PIXEL_Y; i += 8){
      ctx.fillRect(0, PIXEL_SIZE * i + EDITOR_MAIN_Y, max_x, 1);
    }
    ctx.fillRect(PIXEL_SIZE * MAX_PIXEL_Y, EDITOR_MAIN_Y, 1, max_y);
    ctx.fillRect(0, PIXEL_SIZE * MAX_PIXEL_Y + EDITOR_MAIN_Y, max_x + 1, 1);

  }
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
