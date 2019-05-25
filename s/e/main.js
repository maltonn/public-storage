if (window.innerWidth<window.innerHeight){
  window.alert('横持ち推奨です')
}
params={};
//(location.href.split('?')[1]||"s="+window.prompt('何番から？')+"&e="+window.prompt('何番まで？')).split('&').forEach(e=>params[e.split('=')[0]]=e.split('=')[1])
params={'s':'444',"e":'544'}

Main()


function Main(){
  //DecideRandomColor()
  qcol=['#3498db','#2980b9']
  acol=['#e74c3c','#c0392b']
  ques_list=english_lst.slice(Number(params['s']),Number(params['e'])-1)
  ans_list=japanese_lst.slice(Number(params['s']),Number(params['e'])-1)
  qa.style.backgroundColor = qcol[0]
  next.style.backgroundColor = qcol[1]
  i = 0
  isAns = true
  total.innerText="残り"+ques_list.length+"問"
  qa.innerHTML = ques_list[0]
  qa.addEventListener('click', function() {
    if (isAns) {
      qa.innerHTML = ans_list[i]
      qa.style.backgroundColor = acol[0]
      next.style.backgroundColor = acol[1]
      isAns = false
    } else {
      qa.innerHTML = ques_list[i]
      qa.style.backgroundColor = qcol[0]
      next.style.backgroundColor = qcol[1]
      isAns = true
    }
  });

  correct.addEventListener('click', function() {
    ques_list.splice(i, 1);
    ans_list.splice(i, 1);
    if (i >= ques_list.length) {
      i = 0
    }
    GoToNextCard(i)
  });


  wrong.addEventListener('click', function() {
    i++
    if (i >= ques_list.length) {
      i = 0
    }
    GoToNextCard(i)
  });

  wrong_list_btn.addEventListener('click',()=>{
    target_q=ques_list.slice(0,i)
    target_a=ans_list.slice(0,i)
    for(j=0;j<target_q.length;j++){
      elm=document.createElement('div')
      elm.innerHTML='<div>'+target_q[j]+'</div><div>'+target_a[j]+'</div>'
      wrong_list.appendChild(elm)
    }
    wrong_list.style.transform="translatey(0)"
    setTimeout(()=>{
      close_wrong_list.style.display="block"
    },300)
  })

  close_wrong_list.addEventListener('click',function(){
    this.style.display="none"
    wrong_list.style.transform="translateY(100%)"
    setTimeout(()=>{
      wrong_list.innerHTML=""
    },300)
  })

  function GoToNextCard(i){
    if (isAns) {
      qa.innerHTML = ques_list[i]
    } else {
      qa.innerHTML = ans_list[i]
    }
    total.innerText="残り"+ques_list.length+"問"
  }
}
