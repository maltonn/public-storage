//「言った色と違った色が出る」イカサマルーレット
col = null
isMatch=location.href.split('?')[1]=="a"// URLの末尾に　?aを入れると「言った通りの色が出る」になります

flag = true
start_btn.addEventListener('click', () => {//スタートボタンを押したら
  if (flag) {//2重押し防止
    recognition.start()//音声認識開始
    flag=false
    start_btn.style.backgroundColor="#1d4293"
    start_btn.innerText="STOP"
    deg=0
    speed=5
    rotating=setInterval(()=>{//ルーレットを回す
      deg+=speed
      roulette.style.transform="rotate("+deg+"deg)"
    },10)
  } else {//2回目はストップボタンとして機能
    start_btn.style.opacity="0"
    speed=4
    setTimeout(()=>{
      speed=3
    },1000)
    setTimeout(()=>{
      Stop(col)
    },2000)
  }
})

recognition = new webkitSpeechRecognition();//音声認識
recognition.onresult = function(event) {
  if (event.results.length > 0) {
    spoken = event.results[0][0].transcript//言った内容
    console.log(spoken)
    ch1=spoken.split('緑').length - 1 + spoken.split('ミド').length-1 + spoken.split('みど').length-1 //緑　っぽいことを言った回数
    ch2=spoken.split('紫').length - 1 + spoken.split('ムラ').length-1 + spoken.split('むら').length-1 //紫　っぽいことを言った回数
    if (ch1 || ch2) {//どちらも0だったらもう1度
      if (ch1>ch2){
        col = "green"
      }else{
        col = "purple"
      }
    }else{
      recognition.start()
    }
  }
}

function Stop(col){
    if(!isMatch){//初めの値がFalse→「言ってない色が当たる」モードの時は、緑⇔紫を入れ替える
      if(col=="green"){
        col="purple"
      }else if(col=="purple"){
        col="green"
      }
    }
    if (col=="green"){
      if (deg%360<180){
        clearInterval(rotating)
        restart.style.opacity="1"
      }else{
        setTimeout(()=>{
          clearInterval(rotating)
          restart.style.opacity="1"
        },600)
      }
    }
    else if(col=="purple"){
      if (deg%360>180){
        clearInterval(rotating)
        restart.style.opacity="1"
      }else{
        setTimeout(()=>{
          clearInterval(rotating)
          restart.style.opacity="1"
        },600)
      }
    } else {//認識できなかった時は、普通にランダムに回す
      setTimeout(() => {
        clearInterval(rotating)
        restart.style.opacity="1"
      }, Math.round(Math.random() * 1200))
    }
}


restart.addEventListener('click',()=>{
  location.reload();
})
