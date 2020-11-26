
const code = document.getElementById('code')
const textarea = document.getElementById('textarea1')
const img_file = document.getElementById('img_file')
const preview = document.getElementById("preview")
code.addEventListener('change', function(e) {
  var result = e.target.files[0];
  var reader = new FileReader();
  reader.readAsText(result);
  reader.addEventListener('load', function() {
    txt = reader.result
    isHalf = GetIsHalf(txt)
    Sub1(txt, isHalf)
  })
})

txt_input_done_btn.addEventListener('click', function() {
  txt = textarea.value
  isHalf = GetIsHalf(txt)
  Sub1(txt, isHalf)
})

textarea.addEventListener('keydown',function(e){
  if (e.key!="Enter"){
    return false;
  }
  txt = this.value
  isHalf = GetIsHalf(txt)
  Sub1(txt, isHalf)
})

function Sub1(txt, isHalf) {
  setTimeout(() => { //見た目だけ　別にどっちでもいい
    document.getElementById("input_txt").style.transform = "translateY(100%)";
  }, 300)
  output = ""
  //スペースをすべて消す
  txt = Delete(txt, [' ', '\n', '\t'])
  txt_len=isHalf?txt.length:txt.length*2//全角半角で区別
  img_file.addEventListener('change', function(e) {
    var file = e.target.files;
    var reader = new FileReader();
    reader.readAsDataURL(file[0])
    reader.onload = function() { // ファイル読み込みが完了した際のイベント登録
      dataUrl = this.result;
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      var image = new Image();
      image.src = dataUrl
      image.onload = function(event) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = this.width
        canvas.height = this.height
        ctx.drawImage(this, 0, 0)
        var pix = ctx.getImageData(0, 0, this.width, this.height).data
        pix_len = pix.length
        black = 0
        for (i = 0; i < pix_len; i += 4) { //pixデータは[r,g,b,a,r,g,b,a,...]で保存されている
          var grayscale = pix[i] * .3 + pix[i + 1] * .59 + pix[i + 2] * .11;
          if (grayscale < 170) { //グレー判定
            black += 1
          }
          if (grayscale < 85) { //黒判定
            black += 1
          } //grascaleが85未満のものはblackに2足される
        }
        var ratio = txt_len / black * 1.02 //誤差丸め込み // 誰か助けて
        canvas.width *= Math.sqrt(ratio)
        canvas.height *= Math.sqrt(ratio)
        ctx.drawImage(this, 0, 0, canvas.width, canvas.height)

        var pix = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        var pix_len = pix.length
        var j = 0


        if (isHalf){
          for (i = 0; i < pix_len; i += 4) { //pixデータは[r,g,b,a,r,g,b,a,...]で保存されている
            var grayscale = pix[i] * .3 + pix[i + 1] * .59 + pix[i + 2] * .11;
            if (grayscale < 170 && pix[i+3]!=0) {
              output += txt.slice(j, j + 1)
              j++
            } else {
              output += " "
            }
            if (grayscale < 85 && pix[i+3]!=0) {
              output += txt.slice(j, j + 1)
              j++
            } else {
              output += " "
            }
            if ((i / 4 + 1) % canvas.width == 0) {
              output += "\n"
            }
          }
        }else{
          for (i = 0; i < pix_len; i += 4) { //pixデータは[r,g,b,a,r,g,b,a,...]で保存されている
            var grayscale = pix[i] * .3 + pix[i + 1] * .59 + pix[i + 2] * .11;
            if (grayscale < 125 && pix[i+3]!=0) {
              output += txt.slice(j, j + 1)
              j++
            } else {
              output += "　"
            }
            if ((i / 4 + 1) % canvas.width == 0) {
              output += "\n"
            }
          }
        }
        DrowTxt(output, canvas)
      }

      //reader.readAsDataURL(file);
      setTimeout(() => { //見た目だけ　別にどっちでもいい
        document.getElementById("input_img").style.transform = "translateY(100%)"
      }, 300)
    }
  })
}

function Delete(txt, lst) {
  for (i = 0; i < lst.length; i++) {
    t = lst[i]
    while (txt.match(t)) {
      txt = txt.replace(t, "")
    }
  }
  return txt
}

function GetIsHalf(txt) {
  var chr = txt.charCodeAt(0);
  if ((chr >= 0x00 && chr < 0x81) ||
    (chr === 0xf8f0) ||
    (chr >= 0xff61 && chr < 0xffa0) ||
    (chr >= 0xf8f1 && chr < 0xf8f4)) {
    return true;
  } else {
    return false;
  }
}

function DrowTxt(txt, canvas) {
  var r_canvas = document.createElement('canvas')
  var fontSize = 20
  var rctx = r_canvas.getContext('2d')
  r_canvas.width = canvas.width * fontSize
  r_canvas.height = canvas.height * fontSize
  rctx.beginPath();
  rctx.font = fontSize + "px MS Gothic"
  var lines = txt.split("\n")
  var addY = 1;
  for (i = 0; i < lines.length; i++) {
    var line = lines[i];
    addY += fontSize // 2行目以降の水平位置は行数とlineHeightを考慮する
    rctx.fillText(line, 0, addY);
  }
  var data = r_canvas.toDataURL();
  result = document.getElementById("result_img")
  result.src = data

  element = document.getElementById('download_link1')
  element.href = data

  to_about.style.display="none"

  download_links = document.getElementById('download_links')
  flag = true
  result.addEventListener('click', function() {
    form.style.display = "none"
    if (flag) {
      result.style = "position:absolute;top:0;left:0;max-height:1000vh;max-width:1000vw;"
      document.body.style.overflow = "auto"
      download_links.style.opacity = "0"
      flag = false
    } else {
      scrollTo(0,0);
      result.style = "max-height:80vh;max-width:90vw;"
      document.body.style.overflow = "hidden"
      download_links.style.opacity = "1"
      flag = true
    }

  })
  var blob = new Blob([output], {
    "type": "text/plain"
  });
  if (window.navigator.msSaveBlob) {
    window.navigator.msSaveBlob(blob, "test.txt");
    window.navigator.msSaveOrOpenBlob(blob, "test.txt");
  } else {
    element = document.getElementById('download_link2')
    element.href = window.URL.createObjectURL(blob);
  }
}

to_about.addEventListener('click',()=>{
  about.style.transform="translateY(0)"
})
about.addEventListener('click',()=>{
  about.style.transform="translateY(-100%)"
})
