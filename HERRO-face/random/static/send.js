elm = document.createElement('div')
elm.innerHTML = '<input id="text-input" type="text" placeholder="Ctr+Enterで送信"/>'
document.body.appendChild(elm)

document.addEventListener('keydown', function(e) {
  if (e.key == 'Enter' && e.ctrlKey) {
    Send(document.getElementById('text-input').innerText)
  }
})


function Send(text) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = function() {
    if (req.readyState == 4) { // 通信の完了時
      if (req.status == 200) { // 通信の成功時
        var data = eval('(' + req.responseText + ')')
        console.log(data)
      }
    } else {
      console.log('connecting...')
    }
  }
  req.open('POST', 'https://6xwdd58yak.execute-api.us-east-2.amazonaws.com/default/HERRO', true);
  req.setRequestHeader('content-type','application/x-www-form-urlencoded;charset=UTF-8');
  req.send('msg=' + encodeURIComponent(text));

}
