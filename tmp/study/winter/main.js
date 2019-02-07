DeCideContents(window.prompt('コンテンツ名を入力'))
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

function GoToNextCard(i){
  if (isAns) {
    qa.innerHTML = ques_list[i]
  } else {
    qa.innerHTML = ans_list[i]
  }
  total.innerText="残り"+ques_list.length+"問"
}
