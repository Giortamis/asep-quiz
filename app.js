
const FILES = {
  constitutional:"constitutional.json", administrative:"administrative.json", eu:"eu.json",
  economics:"economics.json", it:"it.json", history:"history.json",
  civil_servants:"civil_servants.json", gdpr:"gdpr.json", business:"business.json",
  hr:"hr.json", ethics:"ethics.json"
};

let categories=[], categoryMap=new Map(), currentQuestions=[], currentIndex=0;
let mode="", score=0, answerLocked=false, studyTimer=null, studySeconds=5, autoNext=false;

document.addEventListener("DOMContentLoaded", init);

async function init(){
  categories = await fetch("data/categories.json").then(r=>r.json());
  categories.forEach(c=>categoryMap.set(c.id,c));
  renderCategoryControls();
  goHome();
}

function showOnly(id){
  ["home","testSetup","testHome","studySetup","quizScreen","resultScreen"].forEach(x=>{
    document.getElementById(x).classList.toggle("hidden", x!==id);
  });
}

function goHome(){ clearStudyTimer(); showOnly("home"); }

function renderCategoryControls(){
  const checks=document.getElementById("categoryChecks");
  const study=document.getElementById("studyCategory");
  checks.innerHTML=""; study.innerHTML="";
  study.add(new Option("Όλες οι ενότητες","all"));

  categories.forEach(c=>{
    const label=document.createElement("label");
    label.className="check";
    label.innerHTML=`<input type="checkbox" class="category-check" value="${c.id}"> ${c.name}`;
    checks.appendChild(label);
    study.add(new Option(c.name,c.id));
  });

  document.getElementById("allCategories").addEventListener("change",e=>{
    document.querySelectorAll(".category-check").forEach(ch=>ch.checked=e.target.checked);
  });

  document.querySelectorAll(".category-check").forEach(ch=>{
    ch.addEventListener("change",()=>{
      const all=[...document.querySelectorAll(".category-check")];
      document.getElementById("allCategories").checked=all.every(x=>x.checked);
    });
  });
}

function openTest(){
  const saved=getSavedCategories();
  if(saved.length===0){
    document.querySelectorAll(".category-check").forEach(ch=>ch.checked=true);
    document.getElementById("allCategories").checked=true;
    showOnly("testSetup");
  }else{
    updateTestHome(saved);
    showOnly("testHome");
  }
}

function getSavedCategories(){
  try{return JSON.parse(localStorage.getItem("asepTestCategories")||"[]");}
  catch{return [];}
}

function saveTestCategories(){
  const selected=[...document.querySelectorAll(".category-check:checked")].map(x=>x.value);
  if(selected.length===0){showMessage("Επίλεξε τουλάχιστον μία ενότητα.");return;}
  localStorage.setItem("asepTestCategories",JSON.stringify(selected));
  updateTestHome(selected);
  showOnly("testHome");
}

function updateTestHome(selected){
  const names=selected.map(id=>categoryMap.get(id)?.name).filter(Boolean);
  document.getElementById("activeSummary").innerHTML=
    `<strong>Ενεργές ενότητες: ${names.length}</strong><br><small>${names.join(" · ")}</small>`;
}

function resetTestCategories(){
  if(!confirm("Θέλεις να αλλάξεις τις ενότητες του διαγωνισμού; Τα στατιστικά δεν θα διαγραφούν."))return;
  localStorage.removeItem("asepTestCategories");
  document.querySelectorAll(".category-check").forEach(ch=>ch.checked=true);
  document.getElementById("allCategories").checked=true;
  showOnly("testSetup");
}

async function loadQuestions(ids){
  const sets=await Promise.all(ids.map(id=>fetch(`data/${FILES[id]}`).then(r=>r.json())));
  return sets.flat().map(q=>({...q,categoryId:q.id.split("-")[0]}));
}

async function startTest(){
  const selected=getSavedCategories();
  const requested=parseInt(document.getElementById("testCount").value,10);
  if(!Number.isInteger(requested)||requested<1||requested>100){showMessage("Δώσε αριθμό ερωτήσεων από 1 έως 100.");return;}

  const byCategory={};
  for(const id of selected){
    byCategory[id]=await fetch(`data/${FILES[id]}`).then(r=>r.json());
  }
  currentQuestions=buildProportionalTest(byCategory,requested);
  if(currentQuestions.length===0){showMessage("Δεν βρέθηκαν διαθέσιμες ερωτήσεις.");return;}

  mode="test"; score=0; currentIndex=0;
  showOnly("quizScreen"); renderQuestion();
}

function buildProportionalTest(byCategory,total){
  const ids=Object.keys(byCategory);
  const availableTotal=ids.reduce((s,id)=>s+byCategory[id].length,0);
  const target=Math.min(total,availableTotal);
  let result=[], allocation={}, used=0;

  ids.forEach(id=>{
    const raw=target*(byCategory[id].length/availableTotal);
    allocation[id]=Math.floor(raw);
    used+=allocation[id];
  });

  const remainders=ids.map(id=>({
    id, remainder:target*(byCategory[id].length/availableTotal)-allocation[id]
  })).sort((a,b)=>b.remainder-a.remainder);

  let left=target-used, ri=0;
  while(left>0 && remainders.length){
    const id=remainders[ri%remainders.length].id;
    if(allocation[id]<byCategory[id].length){allocation[id]++;left--;}
    ri++;
    if(ri>10000)break;
  }

  ids.forEach(id=>{
    const arr=shuffle([...byCategory[id]]).slice(0,allocation[id]);
    arr.forEach(q=>result.push({...q,categoryId:id}));
  });
  return shuffle(result);
}

function openStudy(){ showOnly("studySetup"); }

async function startStudy(){
  const selected=document.getElementById("studyCategory").value;
  studySeconds=parseInt(document.getElementById("studySeconds").value,10);
  if(!Number.isInteger(studySeconds)||studySeconds<1||studySeconds>300){showMessage("Δώσε χρόνο από 1 έως 300 δευτερόλεπτα.");return;}
  autoNext=document.getElementById("autoNextStudy").checked;
  const ids=selected==="all"?categories.map(c=>c.id):[selected];
  currentQuestions=await loadQuestions(ids);
  if(document.getElementById("randomStudy").checked)currentQuestions=shuffle(currentQuestions);
  mode="study"; currentIndex=0; score=0;
  showOnly("quizScreen"); renderQuestion();
}

function renderQuestion(){
  clearStudyTimer(); answerLocked=false;
  const q=currentQuestions[currentIndex];
  document.getElementById("quizCounter").textContent=`Ερώτηση ${currentIndex+1} από ${currentQuestions.length}`;
  document.getElementById("quizModeLabel").textContent=mode==="test"?"Τεστ":`Απάντηση σε ${studySeconds}″`;
  document.getElementById("progressBar").style.width=`${(currentIndex/currentQuestions.length)*100}%`;
  document.getElementById("quizCategory").textContent=categoryMap.get(q.categoryId)?.name||q.categoryId;
  document.getElementById("questionText").textContent=q.question;
  document.getElementById("feedback").textContent="";
  document.getElementById("nextButton").classList.add("hidden");
  document.getElementById("revealButton").classList.toggle("hidden",mode!=="study");

  const box=document.getElementById("answers"); box.innerHTML="";
  q.answers.forEach((text,i)=>{
    const b=document.createElement("button");
    b.className="answer"; b.textContent=`${["Α","Β","Γ","Δ"][i]}. ${text}`;
    if(mode==="test")b.onclick=()=>chooseTestAnswer(i);
    box.appendChild(b);
  });

  if(mode==="study"){
    studyTimer=setTimeout(revealStudyAnswer,studySeconds*1000);
  }
}

function chooseTestAnswer(selected){
  if(answerLocked)return;
  answerLocked=true;
  const q=currentQuestions[currentIndex];
  const buttons=[...document.querySelectorAll(".answer")];
  buttons.forEach(b=>b.disabled=true);
  if(selected===q.correct){
    buttons[selected].classList.add("correct"); score++;
    document.getElementById("feedback").textContent="✓ Σωστή απάντηση";
  }else{
    buttons[selected].classList.add("wrong");
    buttons[q.correct].classList.add("correct");
    document.getElementById("feedback").textContent=`✗ Λάθος — σωστή απάντηση: ${["Α","Β","Γ","Δ"][q.correct]}`;
  }
  setTimeout(nextQuestion,1600);
}

function revealStudyAnswer(){
  if(answerLocked)return;
  answerLocked=true; clearStudyTimer();
  const q=currentQuestions[currentIndex];
  const buttons=[...document.querySelectorAll(".answer")];
  buttons[q.correct].classList.add("correct");
  document.getElementById("feedback").textContent=`Σωστή απάντηση: ${["Α","Β","Γ","Δ"][q.correct]}`;
  document.getElementById("revealButton").classList.add("hidden");
  if(autoNext)setTimeout(nextQuestion,1800);
  else document.getElementById("nextButton").classList.remove("hidden");
}

function nextQuestion(){
  clearStudyTimer(); currentIndex++;
  if(currentIndex<currentQuestions.length)renderQuestion();
  else finishQuiz();
}

function finishEarly(){
  if(confirm("Θέλεις να σταματήσεις;"))finishQuiz();
}

function finishQuiz(){
  clearStudyTimer();
  if(mode==="test"){
    const pct=Math.round((score/currentQuestions.length)*100);
    document.getElementById("resultScore").textContent=`${pct}%`;
    document.getElementById("resultDetails").textContent=`Σωστές: ${score} — Λάθος: ${currentQuestions.length-score}`;
  }else{
    document.getElementById("resultScore").textContent="Ολοκλήρωση";
    document.getElementById("resultDetails").textContent=`Εμφανίστηκαν ${Math.min(currentIndex,currentQuestions.length)} από ${currentQuestions.length} ερωτήσεις.`;
  }
  showOnly("resultScreen");
}

function clearStudyTimer(){if(studyTimer){clearTimeout(studyTimer);studyTimer=null;}}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function showMessage(text){
  const el=document.getElementById("message");el.textContent=text;el.classList.remove("hidden");
  setTimeout(()=>el.classList.add("hidden"),2600);
}
