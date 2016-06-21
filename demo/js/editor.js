/*
 Arduboy Web-based bitmap editor

 Copyright (c) 2016 emutyworks

 Released under the MIT license"
 http://opensource.org/licenses/mit-license.php
*/
function edit_counter_clockwize(){
  if(!cur_info['rect']){
    set_edit_mes('no_rect');
    return false;
  }

  var flag = true;
  if(edit_alert){
    flag = edit_confirm_alert('counter clockwize');
  }

  if(flag){    
    var view_x = cur_info['view_x'];
    var view_y = cur_info['view_y'];
    var view_w = cur_info['view_w'];
    var view_h = cur_info['view_h'];

    set_edit_clip();

    for(var y = 0; y < view_h; y++){
      var dy = view_y - 1;
      for(var x = view_w; x >= 0; x--){
        var bw = edit_clip[y][x];
        set_bw(view_x + y,dy, bw);
        dy++;
      }
    }
  }

  del_cur();
  cur_info['rect'] = false;
  redraw_editor();
}

function edit_clockwize(){
  if(!cur_info['rect']){
    set_edit_mes('no_rect');
    return false;
  }

  var flag = true;
  if(edit_alert){
    flag = edit_confirm_alert('clockwize');
  }

  if(flag){    
    var view_x = cur_info['view_x'];
    var view_y = cur_info['view_y'];
    var view_w = cur_info['view_w'];
    var view_h = cur_info['view_h'];

    set_edit_clip();

    var dx = view_x + view_h - 1
    for(var y = 0; y < view_h; y++){
      for(var x = 0; x < view_w; x++){
        var bw = edit_clip[y][x];
        set_bw(dx,view_y + x, bw);
      }
      dx--;
    }
  }

  del_cur();
  cur_info['rect'] = false;
  redraw_editor();
}

function edit_half_turn(){
  if(!cur_info['rect']){
    set_edit_mes('no_rect');
    return false;
  }

  var flag = true;
  if(edit_alert){
    flag = edit_confirm_alert('half turn');
  }

  if(flag){    
    var view_x = cur_info['view_x'];
    var view_y = cur_info['view_y'];
    var view_w = cur_info['view_w'];
    var view_h = cur_info['view_h'];

    set_edit_clip();

    var y = 0;
    for(var dy = view_h - 1; dy >= 0; dy--){
      var dx = view_x + view_w - 1;
      for(var x = 0; x < view_w; x++){
        var bw = edit_clip[y][x];
        set_bw(dx, view_y + dy, bw);
        dx--;
      }
      y++;
    }
  }

  del_cur();
  cur_info['rect'] = false;
  redraw_editor();
}

function edit_horisonal(){
  if(!cur_info['rect']){
    set_edit_mes('no_rect');
    return false;
  }

  var flag = true;
  if(edit_alert){
    flag = edit_confirm_alert('horisonal');
  }

  if(flag){    
    var view_x = cur_info['view_x'];
    var view_y = cur_info['view_y'];
    var view_w = cur_info['view_w'];
    var view_h = cur_info['view_h'];

    set_edit_clip();

    var dx = view_x + view_w - 1;
    for(var x = 0; x < view_w; x++){
      for(var y = 0; y < view_h; y++){
        var bw = edit_clip[y][x];
        set_bw(dx, view_y + y, bw);
      }
      dx--;
    }
  }

  del_cur();
  cur_info['rect'] = false;
  redraw_editor();
}

function edit_vertical(){
  if(!cur_info['rect']){
    set_edit_mes('no_rect');
    return false;
  }

  var flag = true;
  if(edit_alert){
    flag = edit_confirm_alert('vertical');
  }

  if(flag){    
    var view_x = cur_info['view_x'];
    var view_y = cur_info['view_y'];
    var view_w = cur_info['view_w'];
    var view_h = cur_info['view_h'];

    set_edit_clip();

    var dy = view_y + view_h - 1;  
    for(var y = 0; y < view_h; y++){
      for(var x = 0; x < view_w; x++){
        var bw = edit_clip[y][x];
        set_bw(view_x + x, dy, bw);
      }
      dy--;
    }
  }

  del_cur();
  cur_info['rect'] = false;
  redraw_editor();
}

function edit_paste(){
  if(!cur_info['rect'] && !is_clip_d()){
    set_edit_mes('no_rect');
    return false;
  }

  var flag = true;
  if(edit_alert){
    flag = edit_confirm_alert('paste');
  }

  if(flag){
    if(cur_info['rect']){
      paste_edit_clip();
    }else{
      var pos = get_clip_d_pos();
      var clip_x = cur_info['clip_x'];
      var clip_y = cur_info['clip_y'];
      var clip_w = cur_info['clip_w'];
      var clip_h = cur_info['clip_h'];

      if(clip_w > 8){ clip_w = 8; }
      if(clip_h > 8){ clip_h = 8; }
      for(var x = 0; x < clip_w; x++){
        var row = '';
        for(var y = 0; y < clip_h; y++){
          var bw = edit_clip[y][x];
          row = bw + row;
        }
        clipboard[pos + x] = cnv2to16(row);
      }
    }
  }

  del_cur();
  cur_info['rect'] = false;
  redraw_editor();
}

function edit_copy(){
  if(!cur_info['rect'] && !is_clip_d()){
    set_edit_mes('no_rect');
    return false;
  }

  if(cur_info['rect']){
    set_edit_clip();
  }else{
    var pos = get_clip_d_pos();
    cur_info['clip_x'] = 0;
    cur_info['clip_y'] = 0;
    cur_info['clip_w'] = 8;
    cur_info['clip_h'] = 8;

    edit_clip = new Array();

    var p = 7;
    for(var y = 0; y < 8; y++){
      var row = new Array();
      for(var x = 0; x < 8; x++){
        row[x] = cnv16to2(clipboard[pos + x]).charAt(p);
      }
      edit_clip[y] = row;
      p--;
    }
  }

  del_cur();
  cur_info['rect'] = false;
  redraw_editor();
}

function edit_cut(){
  if(!cur_info['rect']){
    set_edit_mes('no_rect');
    return false;
  }

  var flag = true;
  if(edit_alert){
    flag = edit_confirm_alert('cut');
  }
  if(flag){
    var view_x = cur_info['view_x'];
    var view_y = cur_info['view_y'];
    var view_w = cur_info['view_w'];
    var view_h = cur_info['view_h'];

    set_edit_clip();

    for(var y = 0; y < view_h; y++){
      for(var x = 0; x < view_w; x++){
        var dx = x + view_x;
        var dy = y + view_y;
        set_bw(dx, dy, 0);
      }
    }
  }

  del_cur();
  cur_info['rect'] = false;
  redraw_editor();
}

function edit_confirm_alert(mes){
  return window.confirm('Do you ' + mes + ' it?');
}

function set_edit_alert(){
  if($('#edit_alert').prop('checked')){
    edit_alert = false;
  }else{
    edit_alert = true;
  }
}

function redraw_editor(){
  init_editor();
  set_data();

  redraw_clip();
}

function check_edit_area(){
  var x = cur_info['x'];
  var y = cur_info['y'];
  var dx = cur_info['dx'];
  var dy = cur_info['dy'];

  if(y >= 0 && x < CLIP_X && dx < MAX_PIXEL_X + 1 && dy < MAX_PIXEL_Y + 1){
     return true;
  }
  return false;
}

function view_edit_info(){
 if(check_edit_area()){
    var dx = ('000' + cur_info['dx']).slice(-3);
    var dy = ('000' + cur_info['dy']).slice(-3);
    var view_x = ('000' + cur_info['view_x']).slice(-3);
    var view_y = ('000' + cur_info['view_y']).slice(-3);
    var view_w = ('000' + cur_info['view_w']).slice(-3);
    var view_h = ('000' + cur_info['view_h']).slice(-3);

    $('#edit_info').html(
      '<span class="mono"> x:' + dx + " y:" + dy + "</span>" +
      ' <b>Cursor:</b> <span class="mono">x:' + view_x + " y:" + view_y +" w:" + view_w + ' h:' + view_h + "</span>"
    );
  }
}

function change_edit_pixel(x,y){
  if(window.confirm('Data will be reset. Is it OK?')){
    MAX_PIXEL_X = x;
    MAX_PIXEL_Y = y;

    EDITOR_MAX_Y = (PRE_PIXEL_SIZE * 64) + EDITOR_MENU_SIZE + (8 * 64) + 1;

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
      EDITOR_MAX_Y = (PRE_PIXEL_SIZE * MAX_PIXEL_Y) + EDITOR_MENU_SIZE + (PIXEL_SIZE * MAX_PIXEL_Y) + 1;
    }
    EDITOR_MENU_Y = PRE_PIXEL_SIZE * MAX_PIXEL_Y;
    EDITOR_MAIN_Y = EDITOR_MENU_Y + EDITOR_MENU_SIZE;

    init_edit_data();
    init_editor();

    redraw_clip();
  }
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
    ctx.fillStyle = EDITOR_W;

  }else{
    d[x] = '0x' + ('00' + parseInt((d[x] & set_b[y]),10).toString(16)).slice(-2);
    ctx.fillStyle = EDITOR_B;
  
  }
  ctx.fillRect(dx * PIXEL_SIZE + 1, (dy * PIXEL_SIZE + 1) + EDITOR_MAIN_Y, PIXEL_SIZE - 1, PIXEL_SIZE - 1);
  ctx.fillRect((dx * PRE_PIXEL_SIZE) + EDITOR_PRE_X + 1, (dy * PRE_PIXEL_SIZE) + EDITOR_PRE_Y + 1, PRE_PIXEL_SIZE, PRE_PIXEL_SIZE);
 
  var hx_str = get_hx_str();

  $('#hx').val(hx_str);
}

function get_hx_str(){
  var hx_str = '';
  if(MAX_PIXEL_X == 8 || MAX_PIXEL_X == 16){
    hx_str = d.join(', ');
    hx_str += "\n";
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
  return hx_str;
}

function set_editor_fillrect(x,y,w,h,color,alpha){
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x,y,w,h);
  ctx.globalAlpha = 1.0;
}

function set_editor_rect(x,y,w,h,color){
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.fillRect(x + w, y, 1, h);
  ctx.fillRect(x, y + h, w + 1, 1);
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
  var x = cur_info['view_x'];
  var y = cur_info['view_y'];
  var w = cur_info['view_w'];
  var h = cur_info['view_h'];

  if(w > 0 && h > 0){
    for(var dy = y; dy < y + h; dy++){
      for(var dx = x; dx < x + w; dx++){
        set_bw(dx,dy,get_d(dx,dy));
      }
    }
  }else{
    for(var dy = 0; dy < MAX_PIXEL_Y; dy++){
      for(var dx = 0; dx < MAX_PIXEL_X; dx++){
        set_bw(dx,dy,get_d(dx,dy));
      }
    }
  }
}
