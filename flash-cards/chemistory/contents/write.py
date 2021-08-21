import csv
with open ('contents.csv','r',encoding='utf-8_sig') as f:
    lst=list(csv.reader(f))
lst.sort()

questions=[line[0] for line in lst]
answers=[line[1] for line in lst]

add_description_card=True
if add_description_card:
    questions.insert(0,'画面タップで答え合わせ')
    answers.insert(0,'もう一度タップして問題に戻った後、<br> 〇 or × ボタンで次のカードへ')

with open ('../js/data.js','w',encoding='utf-8_sig') as f:
    f.write('ques_list={}\nans_list={}'.format(str(questions),str(answers)))

