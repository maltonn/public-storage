from transformers import AutoTokenizer,AutoModelForQuestionAnswering,QuestionAnsweringPipeline
tokenizer=AutoTokenizer.from_pretrained("KoichiYasuoka/bert-base-japanese-wikipedia-ud-head")
model=AutoModelForQuestionAnswering.from_pretrained("KoichiYasuoka/bert-base-japanese-wikipedia-ud-head")
qap=QuestionAnsweringPipeline(tokenizer=tokenizer,model=model,align_to_words=False)
print(qap(question="国語",context="全学年にわたって小学校の国語の教科書に挿し絵が用いられている"))
