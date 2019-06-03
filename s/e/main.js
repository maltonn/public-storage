if (window.innerWidth<window.innerHeight){
  window.alert('横持ち推奨です')
}
params={};
(location.href.split('?')[1] ||"s=1&e=100").split('&').forEach(e=>params[e.split('=')[0]]=e.split('=')[1])
Main()

function Main(){
  //DecideRandomColor()
  qcol=['#3498db','#2980b9']
  acol=['#e74c3c','#c0392b']
  if(params['isnew']){
    ques_list=english_lst.slice(Number(params['s']-1),Number(params['e']))
    ans_list=japanese_lst.slice(Number(params['s']-1),Number(params['e']))
}else{
  ques_list=GetcookieVal('ques_list')?GetcookieVal('ques_list').split('ω') : english_lst.slice(Number(params['s']-1),Number(params['e']))
  ans_list=GetcookieVal('ans_list')?GetcookieVal('ans_list').split('ω') : japanese_lst.slice(Number(params['s']-1),Number(params['e']))
  }
  qa.style.backgroundColor = qcol[0]
  next.style.backgroundColor = qcol[1]
  i = params['isnew'] ? 0:Number(GetcookieVal('now'))||0
  isAns = true
  total.innerText="残り"+(ques_list.length-i)+"問"
  qa.innerHTML = ques_list[i]
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
  save_btn.addEventListener('click',()=>{
    document.cookie = 'now='+i+';max-age=259200';//3日間
    document.cookie = 'ques_list='+ques_list.join('ω')+';max-age=259200';//3日間//ωに得に意味はない
    document.cookie = 'ans_list='+ans_list.join('ω')+';max-age=259200';//3日間
    done_saving.style.visibility="visible"
    setTimeout(()=>{
      done_saving.style.visibility="hidden"
    },1000)
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
function GetcookieVal(key){
    return ((document.cookie + ';').match(key + '=([^¥S;]*)')||[])[1];
  }
