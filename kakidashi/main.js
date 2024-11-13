var data = []
const url = "https://script.google.com/macros/s/AKfycbydgcKEV0bLRF85Ea-bT64-3AEY4K4rfysYDAy-5kzBos1tfXWCSV5T_tCh-8ssWeUZ/exec";
const requestParams = {
  method: "GET",
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
  },
};
fetch(url, requestParams)
  .then((response) => response.json())
  .then((result) => {
    data=result;
    console.log(data);
    document.getElementById('loader').style.opacity = 0;
    document.getElementById('kak').style.opacity = 1;
    callback(result);
  })
  .catch((e) => console.log(e));

// setTimeout(() => {
//   data = [
//     ['', '大正浪漫 YOASOBI『大正浪漫』原作小説', 'NATSUMI', '単行本', '', '', '時翔。'],
//     ['', 'HOOT', 'カール・ハイアセン', '単行本', '', '', 'その日、ロイが不思議な少年に気づいたのは、いってみればダナ・マザーソンのおかげだった。'],
//     ['', '忘れられた巨人', 'カズオ・イシグロ', '文庫', '？', '', 'イングランドと聞けば、後世の人はのどかな草地とその中をのんびりとうねっていく小道を連想するだろう。'],
//     ['', '日の名残り', 'カズオ・イシグロ', '文庫', '⭐︎', '', 'ここ数日来、頭から離れなかった旅行の件が、どうやら、しだいに現実のものとなっていくようです。'],
//     ['', 'わたしたちが孤児だったころ', 'カズオ・イシグロ', '文庫', '？', '', '一九二三年の夏のことだった。'],
//   ]
//   callback()
// }, 100)

function randInt(max) {
  return Math.floor(Math.random() * max);
}

function callback() {
  r = randInt(data.length);
  kakidashi = data[r][6]
  if (data[r][0]=='禁' || !kakidashi) {
    callback()
    return
  }
  document.getElementById('title').innerText = data[r][1];
  document.getElementById('author').innerText = data[r][2];

  F = (i) => {
    document.getElementById('kakidashi').innerText = kakidashi.slice(0, i);
    if (i < kakidashi.length) {
      setTimeout(() => { F(i + 1) }, 50);
    } else {
      setTimeout(() => {
        document.getElementById('read_this_book').style.opacity = 1;
        document.getElementById('go_to_next_book').style.opacity = 1;
      }, 500);
    }
  }
  F(0)
}

document.getElementById('read_this_book').addEventListener('click', () => {
  document.getElementById('ink').classList.add('active');
  
})

document.getElementById('xbtn').addEventListener('click', () => {
  document.getElementById('ink').classList.remove('active');
})

document.getElementById('go_to_next_book').addEventListener('click', () => {
  document.getElementById('read_this_book').style.opacity = 0;
  document.getElementById('go_to_next_book').style.opacity = 0;
  callback()
})
