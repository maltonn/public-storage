select.style.backgroundColor="#"+["d81159", "8f2d56", "218380", "fbb13c", "73d2de"][Math.floor(Math.random()*5)]

qcol=[]
acol=[]
/*
function DecideRandomColor(){//色をランダムに決めるが、acolは赤寄り、qcolは青寄りにする
  qr=Math.floor(Math.random()*170)+40//40~210の間で調整
  qg=Math.floor(Math.random()*170)+40
  qb=Math.floor(Math.random()*16)+240//240~255の間で調整
  qcol=['rgb('+qr+','+qg+','+qb+')','rgb('+(qr-40)+','+(qg-40)+','+qb+')']
  ar=Math.floor(Math.random()*16)+240
  ag=Math.floor(Math.random()*170)+40
  ab=Math.floor(Math.random()*170)+40
  acol=['rgb('+ar+','+ag+','+ab+')','rgb('+ar+','+(ag-40)+','+(ab-40)+')']
}
*/

contents_index=Object.keys(ques_list_dict)
for(i=0;i<contents_index.length;i++){
  op=document.createElement('option')
  op.value=contents_index[i]
  op.innerText=selection_dict[contents_index[i]]
  selection.appendChild(op)
}
selection.addEventListener('change',(e)=>{
  subj=selection.options[selection.selectedIndex].value
  ques_list=ques_list_dict[subj]
  ans_list=ans_list_dict[subj]
  qa.style.fontSize=font_size_dict[subj]
  select.style.display="none"
  Main()
})




function Main(){
  //DecideRandomColor()
  qcol=['#3498db','#2980b9']
  acol=['#e74c3c','#c0392b']
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
