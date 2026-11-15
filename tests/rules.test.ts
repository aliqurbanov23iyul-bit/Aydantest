import assert from "node:assert/strict";
import test from "node:test";
import {checkArithmetic,distribute,examConfig,matches,questionData} from "../lib/exam-rules";

test("karma test derslere dengeli ve tam dağıtılır",()=>{
 assert.deepEqual(distribute(["a","b","c"],20),{a:7,b:7,c:6});
});
test("yanlış manuel dağılım reddedilir",()=>{
 const payload={requestId:crypto.randomUUID(),courseIds:["a","b"],count:5,distribution:{a:2,b:2},difficulty:"easy",kind:"choice4",mode:"exam",minutes:20,shuffleQuestions:true,shuffleOptions:true,avoidRepeats:true,source:"BANK"};
 assert.equal(examConfig.safeParse(payload).success,false);
 assert.equal(examConfig.safeParse({...payload,distribution:{a:2,b:3}}).success,true);
});
test("Türkçe puanlama boşluk ve büyük harf farkını tolere eder",()=>{
 assert.equal(matches("  İLKOKUL ","ilkokul"),true);
 assert.equal(matches("yanlış","doğru"),false);
});
test("geçersiz şıkları ve hatalı aritmetik sonucu saptar",()=>{
 const item={topicId:"a-1",kind:"choice4",difficulty:"easy",prompt:"12 × 4 = ?",options:["48","44","50","46"],answer:"48",explanation:"On iki ile dördün çarpımı kırk sekizdir.",source:null};
 assert.equal(questionData.safeParse({...item,answer:"49"}).success,false);
 assert.equal(checkArithmetic(questionData.parse(item)),true);
 assert.equal(checkArithmetic(questionData.parse({...item,answer:"44"})),false);
});
