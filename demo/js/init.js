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
var editer = null;
var ctx = null;
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
  CLIP_Y = EDITER_MAIN_Y;

  ctx.fillStyle = EDITER_B;
  ctx.fillRect(CLIP_X, CLIP_Y, max_x, max_y);

  init_clip_guide();
}

function init_clip_guide(){
  var max_x = (CLIP_PIXEL_SIZE * 8 + 1) * CLIP_MAX_X + 1;
  var max_y = (CLIP_PIXEL_SIZE * 8 + 1) * CLIP_MAX_Y + 1;

  ctx.fillStyle = EDITER_LINE;

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
 * editer
 */
function init_area_d(){
  area_d = {
    x: null,
    y: null,
  };
}

function init_editer(){
  var max_x = PIXEL_SIZE * MAX_PIXEL_X;
  var max_y = PIXEL_SIZE * MAX_PIXEL_Y;

  view_edit_info();

  if(area_d['x']!=null || area_d['y']!=null){
    var dx = area_d['x'] * 8;
    var dy = area_d['y'] * 8;

    /* preview */
    ctx.fillStyle = EDITER_B;
    ctx.fillRect(dx * PRE_PIXEL_SIZE, dy * PRE_PIXEL_SIZE, PRE_PIXEL_SIZE * 8, PRE_PIXEL_SIZE * 8);

    ctx.strokeStyle = EDITER_LINE;
    ctx.strokeRect(EDITER_PRE_X, EDITER_PRE_Y, PRE_PIXEL_SIZE * MAX_PIXEL_X, PRE_PIXEL_SIZE * MAX_PIXEL_Y);

    /* editer main */
    ctx.fillStyle = EDITER_B;
    ctx.fillRect(dx * PIXEL_SIZE, EDITER_MAIN_Y + dy * PIXEL_SIZE, PIXEL_SIZE * 8, PIXEL_SIZE * 8);

  }else{
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
  }
  
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

  if(area_d['x']!=null || area_d['y']!=null){
    var dx = area_d['x'] * 8;
    var dy = area_d['y'] * 8;

    for(var i = dx; i < dx + 9; i++){
      if((i % 8)==0){
        ctx.fillStyle = EDITER_GUIDE;
      }else{
        ctx.fillStyle = EDITER_LINE;    
      }
      ctx.fillRect(i * PIXEL_SIZE, EDITER_MAIN_Y + (dy * PIXEL_SIZE), 1, PIXEL_SIZE * 8);
    }

    for(var i = dy; i < dy + 9; i++){
      if((i % 8)==0){
        ctx.fillStyle = EDITER_GUIDE;
      }else{
        ctx.fillStyle = EDITER_LINE;      
      }
      ctx.fillRect(PIXEL_SIZE * dx, EDITER_MAIN_Y + (i * PIXEL_SIZE), PIXEL_SIZE * 8, 1);
    }

  }else{

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

  }

  ctx.fillStyle = EDITER_GUIDE;
  ctx.fillRect(0, EDITER_MAIN_Y + max_y, max_x, 1);
  ctx.fillRect(max_x, EDITER_MAIN_Y, 1, max_y);
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
