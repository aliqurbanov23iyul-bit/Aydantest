export function distribute(ids: string[], count: number) {
  return Object.fromEntries(ids.map((id,index) => [id, Math.floor(count / ids.length) + Number(index < count % ids.length)]));
}
export const normalize = (input:string) => input.normalize("NFKC").trim().replace(/\s+/g," ").toLocaleLowerCase("tr-TR");
export const matches = (response:string, answer:string) => normalize(response) === normalize(answer);
export function shuffled<T>(input:T[]) {
  const result = [...input];
  for (let index=result.length-1; index>0; index--) {
    const swap = Math.floor(Math.random() * (index+1));
    [result[index],result[swap]] = [result[swap],result[index]];
  }
  return result;
}
export function checkArithmetic(question: {prompt:string;answer:string}) {
  const parts = /(-?\d+)\s*([+−×÷*])\s*(-?\d+)\s*=\s*(?:\?|_+)/.exec(question.prompt);
  if (!parts || !/^-?\d+(?:[.,]\d+)?$/.test(question.answer)) return true;
  const a = Number(parts[1]), b = Number(parts[3]);
  const result = {"+":a+b,"−":a-b,"×":a*b,"*":a*b,"÷":a/b}[parts[2]];
  return result !== undefined && Math.abs(result - Number(question.answer.replace(",","."))) < 1e-9;
}
