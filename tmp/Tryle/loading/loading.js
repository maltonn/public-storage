setTimeout(()=>{
  sentence.style.opacity="1"
},300)
setTimeout(()=>{
    sentence.style.opacity="0"
},1000)

titles=document.querySelectorAll('#title_div>div')
i=0
setTimeout(()=>{
  triangle.style.opacity="0"
  go=()=>{
    if(titles[i]){
      titles[i].style.opacity="1"
      titles[i].style.transform="translateY(0)"
      i++
      setTimeout(go,100)
    }
  }
  go()
},1600)

setTimeout(()=>{
    for(i=0;i<titles.length;i++){
      titles[i].style.margin="20px"
    }
},2300)

setTimeout(()=>{
  touch.style.opacity="1"
},2500)

touch.addEventListener('click',()=>{
  touch.style.opacity="0"
  triangle.style="left:auto;right:0;margin:20px;"
  for(i=0;i<titles.length;i++){
    titles[i].style.margin="0"
  }
  setTimeout(()=>{
    title_div.style.opacity="0"
    now_loading.style.opacity="1"
    triangle.style.opacity="1"
    sentence.style.opacity="1"
    L=['Who am I?','I\'ve got to go now...','Akane...? Have I heard that name before somewhere?','It\'s so quiet in here','My head hurts when I try to interact with it...But if it will make people happy...','Please use headphones for the best experience']
    i=0
    go2=()=>{
      if(!L[i]){
        i=0
      }
      sentence.innerText=L[i]
      i++
      setTimeout(go2,400+Math.floor(Math.random()*300))
    }
    go2()
  },400)


})
