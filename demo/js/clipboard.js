/*
Arduboy Web-based bitmap editor

Copyright (c) 2016 emutyworks

Released under the MIT license
https://github.com/emutyworks/BitmapEditor/blob/master/LICENSE.txt
*/
function start_clip_cur(){
  var cx = cur_info['cx'];
  var cy = cur_info['cy'];
  var w = 1;
  var h = 1;

  cur_info['c_down'] = true;
  cur_info['c_rect'] = false;

  if(cur_info['c_clip_w'] > 0 && cur_info['c_clip_h'] > 0){
    w = cur_info['c_clip_w'];
    h = cur_info['c_clip_h'];    
  }

  set_edit_mes('start_cur');
  set_clip_cur(cx, cy, w, h);
}

function end_clip_cur(){
  var x = cur_info['c_view_x'] * CLIP_BLOCK_SIZE + CLIP_X;
  var y = cur_info['c_view_y'] * CLIP_BLOCK_SIZE + CLIP_Y;
  var w = cur_info['c_view_w'] * CLIP_BLOCK_SIZE;
  var h = cur_info['c_view_h'] * CLIP_BLOCK_SIZE;

  cur_info['c_rect'] = true;
  set_editor_fillrect(x, y, w + 1, h + 1, EDITOR_CUR, 0.5);
  set_edit_mes('drag_paste');
}

function view_clip_cur(){
  del_clip_cur();

  if(cur_info['cx'] >= cur_info['c_view_x'] + cur_info['c_view_w'] - 1){
    cur_info['c_view_x'] = cur_info['cx'] - (cur_info['c_view_w'] - 1);
  }else{
    cur_info['c_view_x'] = cur_info['cx'];
  }
  if(cur_info['cy'] >= cur_info['c_view_y'] + cur_info['c_view_h'] - 1){
    cur_info['c_view_y'] = cur_info['cy'] - (cur_info['c_view_h'] - 1);
  }else{
    cur_info['c_view_y'] = cur_info['cy'];
  }

  var x = cur_info['c_view_x'] * CLIP_BLOCK_SIZE + CLIP_X;
  var y = cur_info['c_view_y'] * CLIP_BLOCK_SIZE + CLIP_Y;
  var w = cur_info['c_view_w'] * CLIP_BLOCK_SIZE;
  var h = cur_info['c_view_h'] * CLIP_BLOCK_SIZE;

  set_cursor_rect(x,y,w,h,EDITOR_DRAG,1.0);
  set_cursor_fillrect(x,y,w,h,EDITOR_DRAG,0.5);
}

function drag_clip_cur(){
  var cx = cur_info['cx'];
  var cy = cur_info['cy'];
  var c_view_x = cur_info['c_view_x'];
  var c_view_y = cur_info['c_view_y'];
  var w = (cx - c_view_x) + 1;
  var h = (cy - c_view_y) + 1;

  if(w > 0 && h > 0){
    set_clip_cur(c_view_x, c_view_y, w, h);
  }
}

function set_clip_cur(cx,cy,cw,ch){
  var x = cx * CLIP_BLOCK_SIZE + CLIP_X;
  var y = cy * CLIP_BLOCK_SIZE + CLIP_Y;
  var w = cw * CLIP_BLOCK_SIZE;
  var h = ch * CLIP_BLOCK_SIZE;

  del_clip_cur();
  
  cur_info['c_view_x'] = cx;
  cur_info['c_view_y'] = cy;
  cur_info['c_view_w'] = cw;
  cur_info['c_view_h'] = ch;

  set_cursor_rect(x,y,w,h,EDITOR_CUR);
}

function del_clip_cur(){
  var x = cur_info['c_view_x'] * CLIP_BLOCK_SIZE + CLIP_X;
  var y = cur_info['c_view_y'] * CLIP_BLOCK_SIZE + CLIP_Y;
  var w = cur_info['c_view_w'] * CLIP_BLOCK_SIZE;
  var h = cur_info['c_view_h'] * CLIP_BLOCK_SIZE;

  c_ctx.clearRect(x, y, w + 1, h + 1);
}

function get_clip_hx_str(){
  var hx_str = '';
  for(var y = 0; y < CLIP_MAX_Y; y++){
    var hx = ''; 
    var str = "# " + (y * CLIP_MAX_X) + " - " + (y * CLIP_MAX_X + 7) + " blocks \n";

    for(var x = 0; x < CLIP_MAX_X; x++){
      var pos = (y * CLIP_MAX_X * 8) + (x * 8);
      hx += 
        clipboard[pos]+', '+clipboard[pos+1]+', '+clipboard[pos+2]+', '+clipboard[pos+3]+', '+
        clipboard[pos+4]+', '+clipboard[pos+5]+', '+clipboard[pos+6]+', '+clipboard[pos+7]+",\n";
    }
    hx_str += str + hx;
  }
  return hx_str;
}

function set_clip_data(){
  var add_y = 1;
  
  for(var y = 0; y < CLIP_MAX_Y; y++){
    var add_x = CLIP_X;
  
    for(var x = 0; x < CLIP_MAX_X * 8; x++){
      var row = clipboard[x + (CLIP_MAX_X * y * 8)];
      var p = 7;

      if((x % 8) == 0){
        add_x++;
      }

      for(var j = 0; j < 8; j++){
        var bw = cnv16to2(row).charAt(p);
        if(bw == 1){
          ctx.fillStyle = EDITOR_W;
        }else{
          ctx.fillStyle = EDITOR_B;
        }
        ctx.fillRect(add_x + (CLIP_PIXEL_SIZE * x), CLIP_Y + (CLIP_PIXEL_SIZE * j) + (CLIP_PIXEL_SIZE * y * 8) + add_y, CLIP_PIXEL_SIZE, CLIP_PIXEL_SIZE);
        p--;
      }
    }
    add_y++;
  }
}

function redraw_clip(){
  init_clip();
  set_clip_data();
}

function check_clip_area(){
  var max_x = CLIP_BLOCK_SIZE * CLIP_MAX_X;
  var max_y = CLIP_BLOCK_SIZE * CLIP_MAX_Y;
  var x = cur_info['x'];
  var y = cur_info['y'];

  if(y >= 0 && x > CLIP_X && x < CLIP_X + max_x && y < max_y){
    return true;
  }
  return false;
}

function get_clip(x,y){
  var p = x + (CLIP_MAX_X * 8 * (parseInt(y / 8)));
  var py = parseInt(y % 8);
  return cnv16to2(clipboard[p]).charAt(get_dy[py]);
}
