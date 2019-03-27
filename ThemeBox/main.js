contents=['旅行','学校','家族','恋人','友人','お金','スマートフォン','twitter','SNS','ニュース','出身地', '好きな食べ物', '嫌いな食べ物', '自分の行った最も遠いところ', '面白いトラブルに遭遇した話', '芸人で好きな人の話', '最近読んだ本', 'ペットの話', '休みの日の使い方', '学生時代の話', '将来の夢', 'よく見るテレビ番組やよく聴くラジオ番組', '最近起きた出来事の話', '誕生日の話']
current_id = 0
points = document.getElementsByClassName('outer_point')
for (i = 0; i < points.length; i++) {
  points[i].addEventListener('click', (e) => {
    board = document.getElementById('board1')
    button = board.querySelector('.button')
    board.style.display = "flex"
    h1=document.getElementById('theme')
    h1.innerText=contents[new Date().getMilliseconds()%contents.length]
    board.appendChild(h1)
    console.log(board)
    setTimeout(() => {
      board.style.transform = "rotateX(0)"
    })
    board.style.backgroundColor = "rgba(34,34,34,0.8)"
    if (button.id != "button_f") {
      button.addEventListener('click', () => {
        board.style.transform = "rotateX(-90deg)"
        board.style.backgroundColor = "rgba(34,34,34,0)"
        setTimeout(() => {
          board.style.display = "none"
        }, 300)
      })
    }
  })
}
current_style = ""
