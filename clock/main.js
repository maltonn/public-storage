var target=null;
var isAlready = false;
var display = document.getElementById('display');
var text = display.textContent;
display.textContent = "00:00";
var main = document.getElementById('main');
var selectors = document.getElementsByClassName('time')
for (i = 0; i < selectors.length; i++) {
  selectors[i].addEventListener('click', function() {
    main.style.transform = "translateY(0)";
    main.style.borderRadius = "0";
    console.log(this.id);
    target=Number(this.id);
  })
}
document.addEventListener('click', function() {
  if (isAlready) {
    console.log("timer have already started");
  } else {
    isAlready = true;

    left = document.getElementById('clock_left');
    right = document.getElementById('clock_right');

    left.style.animationDuration = target * 60 + "s";
    right.style.animationDuration = target * 60 / 2 + "s";
    right.style.animationDelay = target * 60 / 2 + "s";
    left.style.animationName = "turn360";
    right.style.animationName = "turn180";

    document.getElementById('innerclock').style.backgroundColor = "#B2EBF2";
    setTimeout(function() {
      half = document.getElementById('clock_half').style.zIndex = "7";
    }, target * 60 / 2 * 1000)

    second = 0;
    setInterval(function() {
      second++;
      min = Math.floor(second / 60);
      sec = second % 60;
      if ((sec + '').length == 1) {
        sec = "0" + sec;
      }
      if ((min + '').length == 1) {
        min = "0" + min;
      }
      display.textContent = min + ":" + sec;
      if (second >= target * 60) {
        done = document.getElementById('done');
        done.style.display="block";
        done.style.transform = "scale(1)";
        done.style.borderRadius = "0";
      }
    }, 1000)
  }
})
