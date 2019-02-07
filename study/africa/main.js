ListX= [206, 278, 416, 484, 639, 93, 155, 216, 332, 413, 652, 775, 762, 746, 575, 584, 649, 885, 552]
ListY=[60, 160, 9, 144, 170, 461, 448, 464, 432, 470, 280, 432, 554, 661, 619, 784, 829, 864, 1006]
Country_List=['モロッコ', 'アルジェリア', 'チュニジア', 'リビア', 'エジプト', 'リベリア', 'コートジヴォワール', 'ガーナ', 'ナイジェリア', 'カメルーン', 'スーダン', 'エチオピア', 'ケニア', 'タンザニア', 'コンゴ民主主義共和国', 'ザンビア', 'ジンバブエ', 'マダガスカル', '南アフリカ']
num=19


h=window.innerHeight/window.innerWidth*100
for(i=0;i<num;i++){
  elm=document.createElement('div')
  elm.style.top=ListY[i]/989*100+10+"vw"
  elm.style.left=ListX[i]/989*100+"%"
  elm.classList.add('box','btn-floating','waves-effect','red')
  elm.id=i
  elm.addEventListener('click',function(){
    if(isDelete.checked){
      this.style.display="none"
    }
    answer.style.top=this.style.top
    answer.style.left=this.style.left
    answer.innerText=Country_List[this.id]
  })
  main.appendChild(elm)
}
