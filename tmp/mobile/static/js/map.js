
function GetMousePosition(ev, elm) {
    clientRect = elm.getBoundingClientRect();
    clickX = event.pageX;
    clickY = event.pageY;
    positionX = clientRect.left + window.pageXOffset;
    positionY = clientRect.top + window.pageYOffset;
    x = clickX - positionX;
    y = clickY - positionY;
    return { x: x, y: y }
}

var isShift = false
var scale_flag = true

detail_elms = document.getElementsByClassName('detail')

var nowscale = 1
map_imgs.addEventListener('wheel', function (ev) {
    if (isShift) {
        ev.preventDefault()
        mpos = GetMousePosition(ev, this)
        if (ev.wheelDelta > 0) {
            nowscale += 0.2
        } else {
            nowscale = Math.max(nowscale - 0.2, 1)
        }
        map_imgs.style.transform = 'scale(' + nowscale + ')'
        map_imgs.style.transform = 'scale(' + nowscale + ')'
    }
    else if (nowscale==1){
        notification.style.opacity = '1'
        setTimeout(() => {
            notification.style.opacity = '0'
        }, 1000)
    }
},{ passive: false })
document.addEventListener('keydown', function (e) {
    if (e.shiftKey) {
        isShift = true
    }
})

document.addEventListener('keyup', function (e) {
    isShift = false
})

dfs=()=>{
    clientRect = map_imgs.getBoundingClientRect();
    console.log(clientRect.width)
    if (clientRect.width > 1000 & scale_flag) {
        scale_flag = false
        for (i = 0; i < detail_elms.length; i++) {
            detail_elms[i].classList.remove('transparent')
        }
    }
    if (clientRect.width <= 1000 & !scale_flag) {
        scale_flag = true
        for (i = 0; i < detail_elms.length; i++) {
            detail_elms[i].classList.add('transparent')
        }
    }
    setTimeout(()=>{
        dfs()
    },500)
}
dfs()