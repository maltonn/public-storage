prev=Date.now()

setInterval(()=>{
    document.getElementById('num').innerText=document.getElementById('text').value.length+"文字"
},100)
document.getElementById('btn').addEventListener('click',()=>{
    area=document.getElementById('result')
    area.classList.add('full')
    sentence=document.getElementById('text').value//.split(' ')
    console.log(sentence)
    var i=0;
    document.addEventListener('keydown',(e)=>{
        now=Date.now()
        if (now-prev<80){
            //do nothing            
        }else{
            prev=now
            if(e.key=="ArrowLeft"){
                i-=1
                if (i<0){
                    i=0
                }
            }else if(e.key=="ArrowRight" || e.key=="Space"){
                i+=1
            }
            result_text.innerText=sentence.slice(0,i)//.join(' ')
        }
    })
})