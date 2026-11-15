export default function StudentLoading(){
 return <div className="stack" aria-busy="true" aria-label="Çalışma alanı yükleniyor"><div className="card skeleton" style={{height:150}}/><div className="grid">{[1,2,3].map(key=><div className="card skeleton" style={{height:90}} key={key}/>)}</div></div>;
}
