/*
 Arduboy Web-based bitmap editor

 Copyright (c) 2016 emutyworks

 Released under the MIT license"
 http://opensource.org/licenses/mit-license.php
*/
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

function get_clip_d_pos(){
  var x = clip_d['x'];
  var y = clip_d['y'];
  return (x * 8) + (CLIP_MAX_X * 8 * y);
}

function redraw_clip(){
  init_clip();
  set_clip_data();
  init_clip_d();
}

function select_clip_d(){
  var cx = cur_info['cx'];
  var cy = cur_info['cy'];
  var x = CLIP_X + ((CLIP_PIXEL_SIZE * 8 + 1) * cx);
  var y = CLIP_Y + ((CLIP_PIXEL_SIZE * 8 + 1) * cy);
  var w = CLIP_PIXEL_SIZE * 8 + 1;
  var h = CLIP_PIXEL_SIZE * 8 + 1;

  if(!is_clip_d()){
    clip_d['x']  = cx;
    clip_d['y']  = cy;

    //set_cursor_rect(x,y,w,h,EDITOR_CUR);
    set_cursor_fillrect(x,y,w + 1,h + 1,EDITOR_CUR,0.5);

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
  var max_x = (CLIP_PIXEL_SIZE * 8 + 1) * CLIP_MAX_X;
  var max_y = (CLIP_PIXEL_SIZE * 8 + 1) * CLIP_MAX_Y;
  var x = cur_info['x'];
  var y = cur_info['y'];

  if(y >= 0 && x > CLIP_X && x < CLIP_X + max_x && y < max_y){
    return true;
  }
  return false;
}