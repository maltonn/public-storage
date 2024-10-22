const monthYear = document.getElementById('monthYear');
const calendarBody = document.getElementById('calendarBody');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

let currentDate = new Date();
function dateDiffInDays(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000; // 1日のミリ秒数
    const diffInTime = date2 - date1;
    return Math.floor(diffInTime / oneDay);
  }
  
  
function renderCalendar() {
    calendarBody.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const StartDurationDate=localStorage.getItem('start') ? new Date(localStorage.getItem('start')) : null;

    monthYear.textContent = `${year}年 ${month + 1}月`;

    let row = document.createElement('tr');
    for (let i = 0; i < firstDay; i++) {
        const cell = document.createElement('td');
        row.appendChild(cell);
    }

    for (let date = 1; date <= lastDate; date++) {
        if (row.children.length === 7) {
            calendarBody.appendChild(row);
            row = document.createElement('tr');
        }
        const cell = document.createElement('td');
        cell.innerHTML = date;
        if (date === new Date().getDate() && year === new Date().getFullYear() && month === new Date().getMonth()) {
            cell.classList.add('today');
        }
        console.log(dateDiffInDays(StartDurationDate,new Date(year,month,date)))
        
        let tmp=dateDiffInDays(StartDurationDate,new Date(year,month,date))%28
        if(StartDurationDate && tmp<=6 && tmp>=0){
            cell.classList.add('red')
        }else{
            cell.classList.remove('red')
        }
        
        cell.addEventListener('click', () => {
            let res=window.confirm("■■■");
            if (res){
                localStorage.setItem('start', `${year}-${month + 1}-${date}`);
            }
            renderCalendar();
        })

        row.appendChild(cell);
    }

    calendarBody.appendChild(row);
}


prevBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

renderCalendar();