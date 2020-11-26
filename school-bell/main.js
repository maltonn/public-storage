var audioElem;
function PlaySound(filepath) {
    audioElem = new Audio();
    audioElem.src = filepath;
    audioElem.play();
}
function StopSound() {
    audioElem.pause();
}

timetable = [
    [0, 0, '休憩時間', true],
    [7, 50, '1時間目', true],
    [8, 40, 'HR - 出席確認をしてください', false],
    [8, 50, '2時間目', true],
    [9, 40, '放課', true],
    [9, 50, '3時間目', true],
    [10, 40, '放課', true],
    [10, 50, '4時間目', true],
    [11, 40, '昼休憩', true],
    [11, 50, '5時間目', true],
    [12,40]
]


arrow_music.addEventListener('click', () => {
    arrow_music.style.transform = 'translateX(100%)'
    setInterval(() => {
        now = new Date()
        
        hour = now.getHours()
        min = now.getMinutes()
        sec = now.getSeconds()


        for (i = 0; i < timetable.length; i++) {
            event = timetable[i]
            next_event = timetable[i + 1]
            if (next_event[0] * 60 + next_event[1] > hour * 60 + min) {
                if (event[0] == hour && event[1] == min && sec == 0) {
                    PlaySound('music/bell.mp3')
                }

                if (event[3]) {
                    timetable_now.innerText = '今は' + event[2] + 'です'
                } else {
                    timetable_now.innerText = event[2]
                }


                next_event_time = new Date()
                next_event_time.setHours(next_event[0])
                next_event_time.setMinutes(next_event[1])
                next_event_time.setSeconds(0)
                remain_sec = parseInt((next_event_time - now) / 1000)
                if (parseInt(remain_sec / 3600)) {
                    remaining_time.innerText = '残り ' + parseInt(remain_sec / 3600) + ":" + ("00" + parseInt(remain_sec / 60) % 60).slice(-2) + ':' + ("00" + (remain_sec) % 60).slice(-2)
                } else {
                    remaining_time.innerText = '残り ' + ("00" + parseInt(remain_sec / 60) % 60).slice(-2) + ':' + ("00" + (remain_sec) % 60).slice(-2)
                }
                break
            }
            timetable_now.innerText = '今日の授業は終了です'
            remaining_time.innerText = ''
        }
    }, 1000)
})