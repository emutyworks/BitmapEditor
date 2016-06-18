/*
 Arduboy Web-based bitmap editor

 Copyright (c) 2016 emutyworks

 Released under the MIT license"
 http://opensource.org/licenses/mit-license.php
*/
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

  if(!is_area_d() && !is_clip_d()){
    unselected_area_alert(mes);
    return false;
  }

  var flag = true;
  if(edit_alert){
    flag = edit_confirm_alert(mes);
  }

  if(flag){
    if(is_area_d()){
      var pos = get_area_d_pos();
      for(var i = 0; i < 8; i++){
        d[i + pos] = edit_clip[i];
      }
    }else if(is_clip_d()){
      var pos = get_clip_d_pos();
      for(var i = 0; i < 8; i++){
        clipboard[i + pos] = edit_clip[i];
      }
    }
  }
 
  redraw_editer();
}

function edit_copy(){
  var mes = 'copy';

  if(!is_area_d() && !is_clip_d()){
    unselected_area_alert(mes);
    return false;
  }

  if(is_area_d()){
    var pos = get_area_d_pos();
    edit_clip = d.slice(pos, pos + 8);
  }else if(is_clip_d()){
    var pos = get_clip_d_pos();
    edit_clip = clipboard.slice(pos, pos + 8);
  }

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

function redraw_editer(){
  init_editer();
  set_data();
  init_area_d();

  redraw_clip();
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

    EDITER_MAX_Y = (PRE_PIXEL_SIZE * 64) + EDITER_MENU_SIZE + (8 * 64) + 1;

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
      EDITER_MAX_Y = (PRE_PIXEL_SIZE * MAX_PIXEL_Y) + EDITER_MENU_SIZE + (PIXEL_SIZE * MAX_PIXEL_Y) + 1;
    }
    EDITER_MENU_Y = PRE_PIXEL_SIZE * MAX_PIXEL_Y;
    EDITER_MAIN_Y = EDITER_MENU_Y + EDITER_MENU_SIZE;

    init_edit_data();
    init_editer();

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
    ctx.fillStyle = EDITER_W;

  }else{
    d[x] = '0x' + ('00' + parseInt((d[x] & set_b[y]),10).toString(16)).slice(-2);
    ctx.fillStyle = EDITER_B;
  
  }
  ctx.fillRect(dx * PIXEL_SIZE + 1, (dy * PIXEL_SIZE + 1) + EDITER_MAIN_Y, PIXEL_SIZE - 1, PIXEL_SIZE - 1);
  ctx.fillRect(dx * PRE_PIXEL_SIZE + EDITER_PRE_X , dy * PRE_PIXEL_SIZE + EDITER_PRE_Y, PRE_PIXEL_SIZE, PRE_PIXEL_SIZE);

  var hx_str = get_hx_str();
  //dev_log();

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

/*
 * data
 */
function get_d(dx,dy){
  var x = dx + parseInt(dy / 8) * MAX_PIXEL_X;
  var y = dy % 8;
  return cnv16to2(d[x]).charAt(get_dy[y]);
}

function set_data(){
  if(area_d['x']!=null || area_d['y']!=null){
    var dx = area_d['x'] * 8;
    var dy = area_d['y'] * 8;
    for(var y = dy; y < dy + 8; y++){
      for(var x = dx; x < dx + 8; x++){
        set_bw(x,y,get_d(x,y));
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
