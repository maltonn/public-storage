f=open(input('ファイル名を入力'),'r')
lines=f.readlines()
L1=[]
L2=[]
for i,line in enumerate(lines):
    line=line.strip()
    if i%2:
        L2.append(line)
    else:
        L1.append(line)
f.close()

fo=open('output.txt','w')
fo.write(str(L1))
fo.write('\n')
fo.write(str(L2))
fo.close()
