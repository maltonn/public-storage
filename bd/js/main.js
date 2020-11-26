if (window.innerWidth<window.innerHeight){
  window.alert('パソコン専用です')
}

﻿board=document.getElementById('games')

L=[]
for(i=0;i<raw_lst.length;i++){
  L.push(raw_lst[i][0])
}
function init(){
  board.innerHTML=""
  for(i=0;i<lst.length;i++){
    game=document.createElement('div')
    game.id='game'+i
    game.classList.add('game')
    title=document.createElement('p')
    title.classList.add('title')
    title.innerText=lst[i][0]
    game.style.marginLeft=i*4+"%"

    author=document.createElement('p')
    author.classList.add('author')
    author.innerText=lst[i][3]

    kind=document.createElement('p')
    kind.classList.add('kind')
    kind.innerText=lst[i][1]

    game.appendChild(title)
    game.appendChild(kind)
    board.appendChild(game)
  }

  board_x=0
  board_y=0
  center=3

  main_game.innerHTML=""
  title=document.createElement('p')
  title.classList.add('title_main')
  title.innerText=lst[center][0]
  author=document.createElement('p')
  author.classList.add('author_main')

  kind=document.createElement('p')
  kind.classList.add('kind_main')
  kind.innerText=lst[center][1]
  main_game.appendChild(title)
  main_game.appendChild(kind)
}

init()

document.addEventListener('wheel',function(e){
  if(e.deltaY>0){//下のゲームを見る
    if (board_y<=-15*(lst.length-4)+0.01){
      return
    }
    board_x-=4
    board_y-=15
    board.style.transform="translateX("+board_x+"%) translateY("+board_y+"%)"
    center+=1
  }else{//上のゲームを見る
    if (board_y>=15*3-0.01){
      return
    }
    board_x+=4
    board_y+=15
    board.style.transform="translateX("+board_x+"%) translateY("+board_y+"%)"
    center-=1
  }

  main_game.innerHTML=""
  title=document.createElement('p')
  title.classList.add('title_main')
  title.innerText=lst[center][0]
  author=document.createElement('p')
  author.classList.add('author_main')
  kind=document.createElement('p')
  kind.classList.add('kind_main')
  kind.innerText=lst[center][1]
  main_game.appendChild(title)
  main_game.appendChild(kind)

})
document.getElementById('play').addEventListener('click',()=>{
  location.href = lst[center][1]
})

d = new Date();
clock.innerHTML="<p>"+("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2)+"</p>"
setInterval(()=>{
  d = new Date();
  clock.innerHTML="<p>"+("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2)+"</p>"
},30000)
