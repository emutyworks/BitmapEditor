/*
 Arduboy Web-based bitmap editor

 Copyright (c) 2016 emutyworks

 Released under the MIT license"
 http://opensource.org/licenses/mit-license.php
*/
window.onload = function(){
  editor = document.getElementById('editor');
  ctx = editor.getContext('2d');

  cursor = document.getElementById('cursor');
  //c_ctx = cursor.getContext('2d');

  init_editor();
  init_clip();

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

    if(check_clip_area()){
      if(event.shiftKey){
        select_clip_d();
      }
    }

    if(check_edit_area()){
      if(event.shiftKey){
        select_area_d();
      }else{
        change_bw();
      }
    }else{
    }
  }

  function onMouseMove(e){
    mousePos(e);
    view_edit_info();
  }

  editor.addEventListener('click', onMouseClick, false);
  editor.addEventListener('mousemove', onMouseMove, false);
  //cursor.addEventListener('click', onMouseClick, false);
  //cursor.addEventListener('mousemove', onMouseMove, false);

  function mousePos(e){
    var rect = e.target.getBoundingClientRect();
    var org_x = e.clientX - rect.left;
    var org_y = e.clientY - rect.top;
    var x = org_x;
    var y = org_y - EDITOR_MAIN_Y;

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

      console.log(up_d);
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
  content += "# clipboard data \n";
  content += get_clip_hx_str();
  content += "# clipboard_data_ended \n";

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

