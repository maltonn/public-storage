var current_slide = intro_slide1
var c = 0;
document.addEventListener('keydown', function(e) {
  if(e.key=="Enter"){
    c++
    slide_action(c)
  }
})
document.addEventListener('click', function() {
  c++
  slide_action(c)
})

melits=melit_list.children
slide_action = (n) => {
  if (n >= 6) {
    twitter.style.display="block"
    cube(n - 7)
    return;
  }
  if(3<=n&&n<=5)
  {
    melits[n-3].style.opacity=1;
    melits[n-3].style.transform="translateY(0)"
  }else{
    switch_slide()
  }
}

cube_surface = cube1.children
cube = (n) => {
  slide_exp.textContent="立方体"
  if (n < 0) {
    switch_slide()
    return;
  }
  if (n >= 4) {
    oct(n - 5)
    return;
  }
  if (n === 3) {
    cube1.style.animationName = "rotation"
    slide_exp.textContent = "完成！"
  } else {
    console.log(n)
    cube_surface[2 * n].classList.add(cube_surface[2 * n].id)
    cube_surface[2 * n + 1].classList.add(cube_surface[2 * n + 1].id)
    slide_exp.textContent = "." + cube_surface[2 * n].id + "と ." + cube_surface[2 * n + 1].id
  }
}

oct_surface = octahedron.children
oct = (n) => {
  slide_exp.textContent="正八面体"
  if (n < 0) {
    switch_slide()
    return;
  }
  if (n >= 5) {
    ter(n - 6)
    return;
  }
  if (n == 4) {
    octahedron.style.transform = "rotateY(390deg) rotateX(190deg)"
    slide_exp.textContent = "完成！"
  } else {
    oct_surface[2 * n].classList.add(oct_surface[2 * n].id)
    oct_surface[2 * n + 1].classList.add(oct_surface[2 * n + 1].id)
    slide_exp.textContent = "." + oct_surface[2 * n].id + "と ." + oct_surface[2 * n + 1].id
  }
}


ter_surface = teragedron.children
ter = (n) => {
  slide_exp.textContent="正四面体"
  if (n < 0) {
    switch_slide()
    return;
  }
  if (n >= 5) {
    final(n-6)
    return;
  }
  if (n == 4) {
    teragedron.style.transform = "rotateX(320deg) rotateY(-160deg) translateY(50%)"
  } else {
    ter_surface[n].classList.add(ter_surface[n].id)
    if (n < 2) {
      ter_surface[n].classList.add('under')
    } else {
      ter_surface[n].classList.add('upper')
    }
  }
}


switch_slide = () => {
  white_circle.style.transform = "scale(20)"
  setTimeout(() => {
    current_slide.style.display = "none"
    white_circle.style.transform = "scale(1)"
    console.log(current_slide)
    current_slide = current_slide.nextElementSibling
    current_slide.style.display = "flex"
  }, 500)
}

intro_slide1.style.display = "flex"




stairs=document.getElementsByClassName('stairs');
(fcn1=(i)=>{
  stairs[i].style.display="block"
  setTimeout(()=>{
    i++
    if(stairs[i]){
      fcn1(i)
    }
  },100)
})(0);



stc=document.getElementsByClassName('stairs_circle');
final=(n)=>{
  slide_exp.textContent=""
  if(n<0){
    switch_slide()
    return;
  }
  if(n>=2){
    summary(n-3)
    return;
  }
  setTimeout(()=>{
    (fcn2=(i)=>{
      radius="-250px"
      stc[i].style.transformOrigin="center center "+radius
      stc[i].style.transform="rotateY(90deg)"
      chd=stc[i].children
      for(j=0;j<chd.length;j++){
          chd[j].style.transformOrigin="center center "+radius
      }
      setTimeout(()=>{
        i++
        if(stc[i]){
          fcn2(i)
        }
      },600)
    })(0);
    setTimeout(()=>{
      st_tower.style.transform="translateY(-20%) rotateX(90deg)"
    },2300)
    setTimeout(()=>{
      (fnc3=(k)=>{
        if(k%2==0){
          stc[k].style.transform="rotateY(-135deg)"
        }else{
          stc[k].style.transform="rotateY(-180deg)"
        }
        stc[k].style.transform="translateZ("+(k*50-200)+"px)"
        stc[k].style.transformOrigin="center center "+(k*-50)+"px"
        chd=stc[k].children
        for(j=0;j<chd.length;j++){
            chd[j].style.transformOrigin="center center "+(k*-50)+"px"
        }
        setTimeout(()=>{
          k++
          if(stc[k]){
            fnc3(k)
          }
        },100)
      })(0)
    },3000)

  },600)
}


summaries=summary_list.children
summary=(n)=>{
  if(n<0){
    switch_slide()
    return;
  }
  if(n>=4){
    switch_slide()
  }
  summaries[n].style.opacity=1;
  summaries[n].style.transform="translateY(0)"
}
