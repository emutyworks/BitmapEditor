/*
Arduboy Web-based bitmap editor

Copyright (c) 2016 emutyworks

Released under the MIT license
https://github.com/emutyworks/BitmapEditor/blob/master/LICENSE.txt
*/
window.onload = function(){
  editor = document.getElementById('editor');
  ctx = editor.getContext('2d');

  cursor = document.getElementById('cursor');
  c_ctx = cursor.getContext('2d');

  init_editor();
  init_clip();

  $('#memo').attr({ value: 'New Character' });
  $('#min_w').attr({ value: cur_info['min_w'] });
  $('#min_h').attr({ value: cur_info['min_h'] });

/*
  $(window).on('beforeunload', function() {
      return "Do you want to reload this site? Changes mane may not be saved.";
  });
*/

  $(function($){
    $(window).keydown(function(e){
      if(e.ctrlKey){
        if(e.keyCode === 67){
          edit_copy();
          return false;
        }
        if(e.keyCode === 86){
          edit_paste();
          return false;
        }
        if(e.keyCode === 88){
          edit_cut();
          return false;
        }
      }
    });
  });

  /* canvas mouse event */
  function onMouseDown(e){
    mousePos(e);

    //clipboard
    if(check_clip_area()){
      if(e.shiftKey && !cur_info['down'] && !cur_info['rect']){
        start_clip_cur();
      }
    }

    //editor
    if(check_edit_area()){
      if(e.shiftKey && !cur_info['c_down'] && !cur_info['c_rect']){
        start_cur();
      }else{
        change_bw();
      }
    }else{
    }
  }

  function onMouseMove(e){
    mousePos(e);

    //clipboard
    if(check_clip_area()){
      if(e.shiftKey && !cur_info['down'] && !cur_info['rect']){
        if(cur_info['c_down']){
          drag_clip_cur();
        }
      }else{
        if(cur_info['c_down']){
          end_clip_cur();
        }
      }
    }else{
      del_edit_mes();
    }

    //editor
    if(check_edit_area()){
      view_edit_info();

      if(e.shiftKey && !cur_info['c_down'] && !cur_info['c_rect']){
        if(cur_info['down']){
          drag_cur();
        }
      }else{
        if(cur_info['down']){
          end_cur();
        }
      }
    }else{
      del_edit_mes();
    }
  }
  cursor.addEventListener('mousedown', onMouseDown, false);
  cursor.addEventListener('mousemove', onMouseMove, false);

  function mousePos(e){
    var rect = e.target.getBoundingClientRect();
    var org_x = e.clientX - rect.left;
    var org_y = e.clientY - rect.top;
    var x = org_x;
    var y = org_y - EDITOR_MAIN_Y;

    //editor
    var dx = parseInt(x / PIXEL_SIZE);
    var dy = parseInt(y / PIXEL_SIZE);

    //clipboard
    var cx = parseInt((x - CLIP_X) / (CLIP_PIXEL_SIZE * 8 + 1));
    var cy = parseInt(y / (CLIP_PIXEL_SIZE * 8 + 1));

    cur_info['org_x'] = org_x;
    cur_info['org_y'] = org_y;
    cur_info['x'] = x;
    cur_info['y'] = y;
    cur_info['dx'] = dx;
    cur_info['dy'] = dy;
    cur_info['cx'] = cx;
    cur_info['cy'] = cy;

    if($('#min_w').val() == 0){ $('#min_w').attr({ value: 1 }); }
    if($('#min_h').val() == 0){ $('#min_h').attr({ value: 1 }); }
    cur_info['min_w'] = parseInt($('#min_w').val(),10);
    cur_info['min_h'] = parseInt($('#min_h').val(),10);
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
      var editor_data = '';
      var clipboard_data = '';
      var editor_data_ended = null;
      var clipboard_data_ended = null;
      for(var i=0; i < up_array.length; i++){
        var row = up_array[i];


        if(row.charAt(0) == '#'){
          if(row.indexOf('[') != -1){
            var comment = row.split("]");
            var key = comment[0].substr(comment[0].indexOf('[')+1).trim();
            up_d[key] = comment[1].trim();
          }else if(row.trim() == '# editor_data_ended' || row.trim() == '# editer_data_ended'){
            editor_data_ended = 1;
          }else if(row.trim() == '# clipboard_data_ended'){
            clipboard_data_ended = 1;
          }
        }else if(row.charAt(0) == '0'){
          if(!editor_data_ended){
            editor_data += row.replace(/\s+/g, "");
          }else if(!clipboard_data_ended){
            clipboard_data += row.replace(/\s+/g, "");
          }
        }
      }

      var pixel = up_d['Pixel'].split('x');
      change_edit_pixel(pixel[0],pixel[1]);
      
      $('#memo').attr('value', up_d['Memo']);
    
      d = editor_data.split(',');
      clipboard = clipboard_data.split(',');
      set_data();
      set_clip_data();
    };

    if(!String.prototype.trim){
      String.prototype.trim = function(){
        return this.replace(/^\s+|\s+$/g,'');
      };
    }
  };
}

/*
 * other
 */
function data_download(){
  var dt = new Date();
  var filename = $("#memo").val() + '.txt';
        
  $('#download').attr('download',filename);

  var content = '';
  content += "# [Create] " + dt.toString() + "\n";
  content += "# [Pixel] " + MAX_PIXEL_X + "x" + MAX_PIXEL_Y + "\n";
  content += "# [Memo] " + $("#memo").val() + "\n";
  content += get_hx_str();
  content += "# editor_data_ended \n";
  content += "# clipboard data (one block = 8x8 pixel = 0x00 x 8)  \n";
  content += get_clip_hx_str();
  content += "# clipboard_data_ended \n";

  var blob = new Blob([ content ], { "type" : "text/plain" });
  
  if(window.navigator.msSaveBlob){
    window.navigator.msSaveBlob(blob, filename); 
  }else{
    document.getElementById("download").href = window.URL.createObjectURL(blob);
  }
}

function set_edit_mes(key){
  $('#edit_mes').html(edit_mes[key]);
}

function del_edit_mes(){
  $('#edit_mes').html('');
}

function cnv16to2(hx){
  return ('00000000' + parseInt(hx,16).toString(2)).slice(-8);
}
function cnv2to16(b){
  return '0x' + ('00' + parseInt(b,2).toString(16)).slice(-2);
}