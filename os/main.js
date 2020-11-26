var nowPath='home'
document.addEventListener('keydown',function(e){
    if(e.key=="Enter"){
        input_str=document.getElementById('in').value
        res=Command(input_str)
        document.getElementById('in').outerHTML="<div class='in'>"+input_str+"</div>"

        outputLine=document.getElementsByClassName('active_output')[0]
        outputLine.innerHTML=res.split('\n') .join('<br>')
        outputLine.classList.remove('active_output')

        elm=document.createElement('div')
        elm.innerHTML="<div class='input_line'><div class='path'>user:~"+nowPath+"$</div><input id='in'></div><div class='output_line active_output'></div>"
        document.getElementById('window').appendChild(elm)
        document.getElementById('in').focus()
    }

})


dirs={
    'home':{
        'chat':{
            'room1':'under construction...',
        },
        'main':{
            'main.txt':'hello from fake-os',
            'about_me.txt':'name:moscwa\ninterest: Machine Learning\ntwitter:@moscwa_'
        }

    }
}

function Command(input_str){
    input=input_str.split(' ')
    splited_path=nowPath.split('/')
    nowdir=dirs
    for (var rp in splited_path){
        nowdir=nowdir[splited_path[rp]]
    }
    if(input[0]=='ls' & input.length==1 ){
        return Object.keys(nowdir).join('　')
    }
    else if (input[0]=='cd'){
        if(input[1] in nowdir){
            if(typeof nowdir[input[1]]=='object'){
                nowPath+='/'+input[1]
                return ''
            }else{
                return 'ディレクトリ名が無効です'
            }
        }else if(input[1]=='../'){
            if(splited_path.length>=2){
                splited_path.pop()
                nowPath=splited_path.join('/')
                return ''
            }else{
                return ''
            }
        }
        else{
            return '指定されたパスが見つかりません'
        }
    }
    else if(input[0]=='cat'){
        if(input[1] in nowdir){
            if(typeof nowdir[input[1]]=='string'){
                return nowdir[input[1]]
            }else{
                return 'ファイル名が無効です'
            }
        }
        else{
            return 'ファイルが見つかりません'
        }
    }
    else if(input[0]=="mkdir"){
        nowdir[input[1]]={}
        return ''
    }
    else if(input[0]=='rm'){
        if (input[1] in nowdir){
            delete nowdir[input[1]]
            return ''
        }else{
            return 'ファイルが見つかりません'
        }
    }else if (input[0]=='help'){
        return '今使えるコマンドは以下のとおりです。\n ls\n cd\n cat mkdir\n rm'
    }else if(input[0]=='sudo'){
        return "permission error"
    }
    else{
        return '\''+input[0]+'\'は、内部コマンドまたは外部コマンド、\n操作可能なプログラムまたはバッチ ファイルとして認識されていません。'
    }
}
