table1 = "sf1"
table2="sf2"
current_result={}
connected=false
req = new Request('https://light-api.mybluemix.net/admin');
loading.style.display="block"
fetch(req)
  .then(response => {
    if (response.status === 200) {
      return response.json()
    } else {
      window.alert('サーバーとの通信中にエラーが発生しました。')
    }
  }).then(response=>{
    console.log(response)
    current_result=response
    connected=true
    loading.style.display="none"
    if(document.cookie.indexOf('q1=')+1){
        if(connected){
          question1.innerHTML = '<canvas id="chart1" width="400" height="400"></canvas>'
          Drow('chart1',(current_result[table1]||{}),null)
        }
    }
  })

document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('select');
  var instances = M.FormSelect.init(elems);
});
select1.addEventListener('change', () => {
  document.getElementById('no-re-submit').style.opacity = "1"
  submit1.classList.remove('disabled')
})


submit1.addEventListener('click', () => {
  loading.style.display="block"
  myRequest = new Request('https://light-api.mybluemix.net/send?table=' + table1 + '&key=' + select1.value);
  fetch(myRequest)
    .then(response => {
      if (response.status === 200) {
        return response.json();
      } else {
        window.alert('サーバーとの通信中にエラーが発生しました。')
      }
    })
    .then(response => {
        if(connected){
          tmp=select1.value.slice()
          question1.innerHTML = '<canvas id="chart1" width="400" height="400"></canvas>'
          Drow('chart1',(current_result[table1]||{}),tmp)
          document.cookie = 'q1=1;max-age=864000';//10日間
          loading.style.display="none"
        }else{
          window.alert('サーバーとの通信が確立されません。\n10秒後くらいにもう一度お試しください。')
        }
    })
})


input1.addEventListener('change',()=>{
  submit2.classList.remove('disabled')
})

submit2.addEventListener('click', () => {
  loading.style.display="block"
  myRequest = new Request('https://light-api.mybluemix.net/send?table=' + table2 + '&val=' + input1.value);
  fetch(myRequest)
    .then(response => {
      if (response.status === 200) {
        return response.json();
      } else {
        window.alert('サーバーとの通信中にエラーが発生しました。')
      }
    })
    .then(response => {
         M.toast({html: '提出完了！'})
         input1.value=""
         loading.style.display="none"
         submit2.classList.add('disabled')
    })
})



labels={
  1:"アトラクション",
  2:"企画展示",
  3:"その他",
}
function Drow(id,result,new_val) {
  if (new_val){
    if (result[new_val]){
      result[new_val]+=1
    }else{
      result[new_val]=1
    }
  }

  var ctx = document.getElementById(id).getContext('2d');
  var myChart = new Chart(ctx, {
    type: 'pie',
    data: {
      datasets: [{
        data: Object.values(result),
        backgroundColor:['#f44336','#2196f3','#4caf50','#cddc39','#ff9800','#795548']
      }],
      labels:Object.keys(result).map((d) => {return labels[d]})
    }
  });
}
