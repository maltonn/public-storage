stairs=document.getElementsByClassName('stairs');


fcn1=(i)=>{
  stairs[i].style.display="block"
  setTimeout(()=>{
    i++
    if(stairs[i]){
      fcn1(i)
    }
  },100)
};


stc=document.getElementsByClassName('stairs_circle');
fcn2=(i)=>{
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
};

fcn3=(k)=>{
  stc[k].style.top="100%"
  stc[k].style.transform="rotateY(-90deg)"
  setTimeout(()=>{
    k++
    if(stc[k]){
      fcn3(k)
    }
  },100)
}

fcn4=(k)=>{
  chld=octahedron.children
  if(!chld[k]){
    st_tower.style.display="none"
    loading2.style.display="none"
    loading3.style.display="none"
    setTimeout(()=>{
      main.style.opacity="1"
      document.body.style.overflowY="auto"
    },300)
    return;
  }
  if(k%2==0){
    chld[k].style.transform="translateY(70vw)"
  }else{
    chld[k].style.transform="translateY(-70vw)"
  }
  setTimeout(()=>{
    k++
    fcn4(k)
  },300)
}

window.onload=setTimeout(()=>{loading0.style.display="none";loading1.style.opacity="1"
setTimeout(()=>{fcn1(0);loading1.style.display="none"
setTimeout(()=>{fcn2(0)
setTimeout(()=>{fcn3(0)
setTimeout(()=>{octahedron.style.display="block"
setTimeout(()=>{octahedron.style.transform="translateY(0) rotateY(70deg) rotateX(80deg)"
setTimeout(()=>{fcn4(0);st_tower.style.transform="translateY(50%)"
},1000)
},100)
},500)
},2300)
},600)
},5000)
},1000)
