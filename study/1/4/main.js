DeCideContents(window.prompt('コンテンツ名を入力'))
qa.style.backgroundColor = qcol[0]
next.style.backgroundColor = qcol[1]
i = 0
isAns = true

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
next.addEventListener('click', function() {
  i++
  if (i > ques_list.length) {
    i = 0
  }
  if (isAns) {
    qa.innerHTML = ques_list[i]
  } else {
    qa.innerHTML = ans_list[i]
  }
});
isOn = true
option.addEventListener('click', function() {
  if (isOn) {
    js_style.innerText = "rt{opacity:0}"
    option.innerText = "送り仮名をつける"
    isOn = false
  } else {
    option.innerText = "送り仮名を消す"
    js_style.innerText = "rt{opacity:1}"
    isOn = true
  }
})
