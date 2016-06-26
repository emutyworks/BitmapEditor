/*
Arduboy Web-based bitmap editor

Copyright (c) 2016 emutyworks

Released under the MIT license
https://github.com/emutyworks/BitmapEditor/blob/master/LICENSE.txt
*/
function paste_edit_clip(){
  if(check_select_area() == 'edit'){
    var view_x = cur_info['view_x'];
    var view_y = cur_info['view_y'];
    var view_w = cur_info['view_w'];
    var view_h = cur_info['view_h'];

    if(edit_clip){
      for(var y = 0; y < view_h; y++){
        for(var x = 0; x < view_w; x++){
          var dx = x + view_x;
          var dy = y + view_y;
          try{
            var bw = edit_clip[y][x];
            if(merge_paste){
              if(bw == 1){
                set_bw(dx, dy, bw);
              }
            }else{
              set_bw(dx, dy, bw);
            }
          }catch(e){}
        }
      }
    }
  }else if(check_select_area() == 'clip'){
    var c_clip_x = cur_info['c_view_x'];
    var c_clip_y = cur_info['c_view_y'];
    var c_clip_w = cur_info['c_view_w'];
    var c_clip_h = cur_info['c_view_h'];

    if(edit_clip){
      for(var y = 0; y < c_clip_h * 8; y++){
        for(var x = 0; x < c_clip_w * 8; x++){
          try{
            var bw = edit_clip[y][x];
            if(!merge_paste){
                set_clip_bw(x + (c_clip_x * 8), y + (c_clip_y * 8), bw);
            }else{
              if(bw == 1){
                set_clip_bw(x + (c_clip_x * 8), y + (c_clip_y * 8), bw);
              }
            }
         }catch(e){}
        }
      }
    }
  }
}

function set_clip_bw(x,y,bw){
  var p = x + (CLIP_MAX_X * 8 * (parseInt(y / 8)));
  var py = parseInt(y % 8);

  if((x > CLIP_MAX_X * 8) || (y > CLIP_MAX_Y * 8)){
    return false;
  }

  if(bw==1){
    clipboard[p] = '0x' + ('00' + parseInt((clipboard[p] | set_w[py]),10).toString(16)).slice(-2);
  }else{
    clipboard[p] = '0x' + ('00' + parseInt((clipboard[p] & set_b[py]),10).toString(16)).slice(-2);
  }
}

function set_edit_clip(){
  copy_data();
  paste_flag = true;
  
  if(check_select_area() == 'edit'){
    var clip_x = cur_info['view_x'];
    var clip_y = cur_info['view_y'];
    var clip_w = cur_info['view_w'];
    var clip_h = cur_info['view_h'];
    var c_clip_w = parseInt(cur_info['view_w'] / 8);
    var c_clip_h = parseInt(cur_info['view_h'] / 8);

    cur_info['clip_x'] = clip_x;
    cur_info['clip_y'] = clip_y;
    cur_info['clip_w'] = clip_w;
    cur_info['clip_h'] = clip_h;

    if((cur_info['view_w'] % 8) > 0){ c_clip_w++; }
    if((cur_info['view_h'] % 8) > 0){ c_clip_h++; }
    cur_info['c_clip_w'] = c_clip_w;
    cur_info['c_clip_h'] = c_clip_h;
    
    edit_clip = new Array();

    for(var y = 0; y < clip_h; y++){
      var row = new Array();
      for(var x = 0; x < clip_w; x++){
        row[x] = get_d(x + clip_x, y + clip_y);
      }
      edit_clip[y] = row;
    }

  }else if(check_select_area() == 'clip'){
    var c_clip_x = cur_info['c_view_x'];
    var c_clip_y = cur_info['c_view_y'];
    var c_clip_w = cur_info['c_view_w'];
    var c_clip_h = cur_info['c_view_h'];
    cur_info['c_clip_x'] = c_clip_x;
    cur_info['c_clip_y'] = c_clip_y;
    cur_info['c_clip_w'] = c_clip_w;
    cur_info['c_clip_h'] = c_clip_h;

    cur_info['clip_w'] = c_clip_w * 8;
    cur_info['clip_h'] = c_clip_h * 8;

    edit_clip = new Array();

    for(var y = 0; y < c_clip_h * 8; y++){
      var row = new Array();
      for(var x = 0; x < c_clip_w * 8; x++){
        row[x] = get_clip(x + (c_clip_x * 8), y + (c_clip_y * 8));
      }
      edit_clip[y] = row;
    }
  }
}

function start_cur(){
  var dx = cur_info['dx'];
  var dy = cur_info['dy'];
  var w = cur_info['min_w'];
  var h = cur_info['min_h'];

  if(cur_info['rect']){
    init_editor();
  }

  cur_info['down'] = true;
  cur_info['rect'] = false;

  if(cur_info['clip_w'] > 0 && cur_info['clip_h'] > 0){
    w = cur_info['clip_w'];
    h = cur_info['clip_h'];    
  }

  set_edit_mes('start_cur');
  set_cur(dx, dy, w, h);
}

function end_cur(){
  var x = cur_info['view_x'] * PIXEL_SIZE;
  var y = cur_info['view_y'] * PIXEL_SIZE + EDITOR_MAIN_Y;
  var w = cur_info['view_w'] * PIXEL_SIZE;
  var h = cur_info['view_h'] * PIXEL_SIZE;

  set_editor_fillrect(x, y, w + 1, h + 1, EDITOR_CUR, 0.5);

  cur_info['rect'] = true;
  set_edit_mes('drag_paste');
}


function view_cur_bw(){
  var view_x = cur_info['view_x'];
  var view_y = cur_info['view_y'];
  var view_w = cur_info['view_w'];
  var view_h = cur_info['view_h'];

  if(edit_clip){
    for(var y = 0; y < view_h; y++){
      for(var x = 0; x < view_w; x++){
        var dx = x + view_x;
        var dy = y + view_y;
        try{
          var bw = edit_clip[y][x];
          set_bw(dx, dy, bw, 'cur');
        }catch(e){}
      }
    }
  }
}

function view_cur(){
  del_cur_all();
  view_cur_bw();

  if(cur_info['dx'] > cur_info['view_x'] + 5){
    cur_info['view_x'] = cur_info['dx'] - cur_info['view_w'];
  }else{
    cur_info['view_x'] = cur_info['dx'];
  }
  if(cur_info['dy'] > cur_info['view_y'] + 5){
    cur_info['view_y'] = cur_info['dy'] - cur_info['view_h'];
  }else{
    cur_info['view_y'] = cur_info['dy'];
  }

  var x = cur_info['view_x'] * PIXEL_SIZE;
  var y = cur_info['view_y'] * PIXEL_SIZE + EDITOR_MAIN_Y;
  var w = cur_info['view_w'] * PIXEL_SIZE;
  var h = cur_info['view_h'] * PIXEL_SIZE;

  set_cursor_rect(x,y,w,h,EDITOR_DRAG,1.0);
  set_cursor_fillrect(x,y,w,h,EDITOR_DRAG,0.5);
}

function drag_cur(){
  var dx = cur_info['dx'];
  var dy = cur_info['dy'];
  var view_x = cur_info['view_x'];
  var view_y = cur_info['view_y'];
  var min_w = cur_info['min_w'];
  var min_h = cur_info['min_h'];
  var w = dx - view_x;
  var h = dy - view_y;

  if(w > 0 && h > 0){
    if(w < min_w){ w = min_w; }
    if(h < min_h){ h = min_h; }

    set_cur(view_x, view_y, w, h);
  }
}

function set_cur(dx,dy,dw,dh){
  var x = dx * PIXEL_SIZE;
  var y = dy * PIXEL_SIZE + EDITOR_MAIN_Y;
  var w = dw * PIXEL_SIZE;
  var h = dh * PIXEL_SIZE;

  del_cur();

  cur_info['view_x'] = dx;
  cur_info['view_y'] = dy;
  cur_info['view_w'] = dw;
  cur_info['view_h'] = dh;

  set_cursor_rect(x,y,w,h,EDITOR_CUR);
}

function del_cur(){
  var x = cur_info['view_x'] * PIXEL_SIZE;
  var y = cur_info['view_y'] * PIXEL_SIZE + EDITOR_MAIN_Y;
  var w = cur_info['view_w'] * PIXEL_SIZE;
  var h = cur_info['view_h'] * PIXEL_SIZE;

  c_ctx.clearRect(x, y, w + 1, h + 1);
}

function del_cur_all(){
  c_ctx.clearRect(0, 0, EDITOR_MAX_X, EDITOR_MAX_Y);
}

function set_cursor_fillrect(x,y,w,h,color,alpha){
  c_ctx.globalAlpha = alpha;
  c_ctx.fillStyle = color;
  c_ctx.fillRect(x,y,w,h);
  c_ctx.globalAlpha = 1.0;
}

function set_cursor_rect(x,y,w,h,color){
  c_ctx.fillStyle = color;
  c_ctx.fillRect(x, y, w, 1);
  c_ctx.fillRect(x, y, 1, h);
  c_ctx.fillRect(x + w, y, 1, h);
  c_ctx.fillRect(x, y + h, w + 1, 1);
}

function check_select_area(){
  if(check_edit_area()){
    return 'edit';
  }else if(check_clip_area()){
    return 'clip';
  }
  return false;
}
