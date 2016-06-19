/*
 Arduboy Web-based bitmap editor

 Copyright (c) 2016 emutyworks

 Released under the MIT license"
 http://opensource.org/licenses/mit-license.php
*/
function get_clip_hx_str(){
  var hx_str = '';
  for(var i = 0; i < (CLIP_MAX_X * 8 * CLIP_MAX_Y) / 16; i++){
    var cx = i * 16;
    hx_str += 
      clipboard[cx]+', '+clipboard[cx+1]+', '+clipboard[cx+2]+', '+clipboard[cx+3]+', '+
      clipboard[cx+4]+', '+clipboard[cx+5]+', '+clipboard[cx+6]+', '+clipboard[cx+7]+', '+
      clipboard[cx+8]+', '+clipboard[cx+9]+', '+clipboard[cx+10]+', '+clipboard[cx+11]+', '+
      clipboard[cx+12]+', '+clipboard[cx+13]+', '+clipboard[cx+14]+', '+clipboard[cx+15]+",\n";
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
  //console.log(clip_d);
  //console.log(clipboard);
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

/*
function set_clip_cur(cx,cy){
  var cux = CLIP_X + ((CLIP_PIXEL_SIZE * 8 + 1) * cx);
  var cuy = CLIP_Y + ((CLIP_PIXEL_SIZE * 8 + 1) * cy);

  c_ctx.globalAlpha = 0.5;
  c_ctx.fillStyle = EDITOR_CUR;
  c_ctx.fillRect(cux, cuy, CLIP_PIXEL_SIZE * 8 + 2, CLIP_PIXEL_SIZE * 8 + 2);
  c_ctx.globalAlpha = 1.0;
}

function del_clip_cur(cx,cy){
  var cux = CLIP_X + ((CLIP_PIXEL_SIZE * 8 + 1) * cx);
  var cuy = CLIP_Y + ((CLIP_PIXEL_SIZE * 8 + 1) * cy);

  c_ctx.clearRect(cux, cuy, CLIP_PIXEL_SIZE * 8 + 2, CLIP_PIXEL_SIZE * 8 + 2);
}
*/

function select_clip_d(){
  var x = cur_info['x'];
  var y = cur_info['y'];
  var cx = parseInt((x - CLIP_X) / (CLIP_PIXEL_SIZE * 8 + 1));
  var cy = parseInt(y / (CLIP_PIXEL_SIZE * 8 + 1));
  var cux = CLIP_X + ((CLIP_PIXEL_SIZE * 8 + 1) * cx);
  var cuy = CLIP_Y + ((CLIP_PIXEL_SIZE * 8 + 1) * cy);

  if(!is_clip_d()){
    clip_d['x']  = cx;
    clip_d['y']  = cy;

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = EDITOR_CUR;
    ctx.fillRect(cux, cuy, CLIP_PIXEL_SIZE * 8 + 2, CLIP_PIXEL_SIZE * 8 + 2);
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
  var max_x = (CLIP_PIXEL_SIZE * 8 + 1) * CLIP_MAX_X;
  var max_y = (CLIP_PIXEL_SIZE * 8 + 1) * CLIP_MAX_Y;
  var x = cur_info['x'];
  var y = cur_info['y'];

  if(y >= 0 && x > CLIP_X && x < CLIP_X + max_x && y < max_y){
    return true;
  }
  return false;
}