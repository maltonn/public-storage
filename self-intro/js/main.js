
socket = io("https://vote-slide.herokuapp.com/d?r=FBLY");
socket.emit("room", "FBLY");
var current_slide = top_slide;
for (top_slide.style.display = "flex", (start = (() => {
    for (actions_lists = document.getElementsByClassName("actions-list"), i = 0; i < actions_lists.length; i++)
      for (j = 0; j < actions_lists[i].children.length; j++) actions_lists[i].children[j].classList.add("action");
    setTimeout(() => {
      top_slide.style.zIndex = "150"
    })
  }))(), slides_list = document.getElementsByTagName("section"), i = 0; i < slides_list.length; i++) slides_list[i].style.zIndex = 100 - i;


function Drow(e, t, n, s, c) {
  return chart_class = new Chart(e, {
    type: c,
    data: {
      labels: n,
      datasets: [{
        label: t,
        data: s,
        backgroundColor: ["rgba(244, 67, 54,.5)", "rgba(139, 195, 74,.5)", "rgba(103, 58, 183,.5)", "rgba(33, 150, 243,.5)", "rgba(255, 193, 7,1.5)", "rgba(121, 85, 72,.5)", "rgba(233, 30, 99,.5)"]
      }]
    },
    options: {
      responsive: !0,
      maintainAspectRatio: !1
    }
  }), chart_class
}
charts = document.getElementsByClassName("chart"), chart_count = 0, chart = null, main_func = (() => {
  console.log(current_slide.nextElementSibling.classList,current_slide.nextElementSibling.id)
  action = document.querySelector("#" + current_slide.id + " .action"),action ? action.classList.remove("action") :(current_slide.nextElementSibling.classList.contains("vote") ? (chart = charts[chart_count], chart_count += 1, q = question_obj[current_slide.nextElementSibling.id], socket.emit("question", q), chc_list = [], ans_list = [], resulting_div = document.createElement("div")) : socket.emit("end_voting"), switch_slide())
}), switch_slides = document.querySelectorAll("#switch_slides_div > div"), back_slide = (() => {
  current_slide.style.zIndex = "110", (current_slide = current_slide.previousElementSibling).style.transform = "rotate(0)"
}), switch_slide = (() => {
  current_slide.style.display = "none", current_slide = current_slide.nextElementSibling
}), flag = !0, chart_class = null, socket.on("answer", function(e) {
  index = chc_list.indexOf(e), index < 0 ? (chc_list.push(e), ans_list.push(1)) : ans_list[index] += 1, flag ? chart_class = Drow(chart.getContext("2d"), "sample", chc_list, ans_list, "pie") : chart_class.update(), flag = !1
}), socket.on("redo", function(e) {
  index = chc_list.indexOf(e), ans_list[index] -= 1, chart_class.update()
}), socket.on("comment", function(e) {
  console.log(e), e.length > 32 && (e = e.slice(0, 33)), elm = document.createElement("div"), elm.innerHTML = e, elm.classList.add("comment"), elm.style.top = 90 * Math.random() + "%", elm.style.animationName = "shed", document.body.appendChild(elm)
}), document.addEventListener("click", function() {
  main_func()
});
document.addEventListener("keydown", function(e) {
  e.key=="Enter"?main_func():0
});