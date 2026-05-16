import { useState, useRef, useEffect, useCallback } from 'https://esm.sh/react@18';
import { createElement as e, Fragment } from 'https://esm.sh/react@18';
import { createRoot } from 'https://esm.sh/react-dom@18/client';

const D = {
  bg:'#0e0f11',sur:'#16181c',card:'#1c1f26',bdr:'#2a2d36',
  acc:'#4a9eff',accdim:'#1a3a5c',txt:'#e8eaf0',mut:'#6b7280',
  faint:'#3a3d47',ok:'#34d399',warn:'#fbbf24',err:'#f87171',pur:'#a78bfa'
};

  const css = {
  app:{background:D.bg,minHeight:'100vh',color:D.txt,fontFamily:"'Inter',system-ui,sans-serif",display:'flex',flexDirection:'column'},
  nav:{background:D.sur,borderBottom:`1px solid ${D.bdr}`,padding:'0 16px',display:'flex',alignItems:'center',justifyContent:'space-between',height:56,flexShrink:0,gap:8,flexWrap:'wrap'},
  logo:{fontSize:18,fontWeight:700,letterSpacing:4,color:D.txt},
  logoSub:{fontSize:9,letterSpacing:3,color:D.mut,display:'block',marginTop:-4},
  tab:(a)=>({background:a?D.accdim:'transparent',color:a?D.acc:D.mut,border:'none',borderRadius:6,padding:'6px 10px',fontSize:11,fontWeight:500,cursor:'pointer',letterSpacing:1}),

  body:{flex:1,padding:'20px',maxWidth:900,margin:'0 auto',width:'100%',boxSizing:'border-box'},
  card:{background:D.card,border:`1px solid ${D.bdr}`,borderRadius:12,padding:'16px 20px',marginBottom:16},
  cardTitle:{fontSize:11,fontWeight:600,letterSpacing:2,color:D.mut,textTransform:'uppercase',marginBottom:12},
  g2:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12},
  g3:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12},
  g4:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:10},
  metric:{background:D.sur,borderRadius:8,padding:'12px 14px',border:`1px solid ${D.bdr}`},
  badge:(c)=>({background:c+'22',color:c,fontSize:10,fontWeight:600,letterSpacing:1,padding:'3px 8px',borderRadius:4,textTransform:'uppercase',border:`1px solid ${c}44`,display:'inline-block'}),
  btn:(v)=>({background:v==='pri'?D.acc:v==='danger'?D.err+'22':'transparent',color:v==='pri'?'#fff':v==='danger'?D.err:D.acc,border:v==='pri'?'none':v==='danger'?`1px solid ${D.err}44`:`1px solid ${D.bdr}`,borderRadius:7,padding:'8px 16px',fontSize:13,fontWeight:500,cursor:'pointer'}),
  inp:{background:D.sur,border:`1px solid ${D.bdr}`,borderRadius:7,padding:'8px 12px',fontSize:13,color:D.txt,width:'100%',outline:'none',boxSizing:'border-box'},
  sel:{background:D.sur,border:`1px solid ${D.bdr}`,borderRadius:7,padding:'8px 12px',fontSize:13,color:D.txt,width:'100%',outline:'none',boxSizing:'border-box'},
  ta:{background:D.sur,border:`1px solid ${D.bdr}`,borderRadius:7,padding:'8px 12px',fontSize:13,color:D.txt,width:'100%',outline:'none',boxSizing:'border-box',resize:'vertical',fontFamily:'inherit'},
  lbl:{fontSize:11,color:D.mut,letterSpacing:1,textTransform:'uppercase',marginBottom:4,display:'block'},
  divider:{borderTop:`1px solid ${D.bdr}`,margin:'14px 0'},
  row:{display:'flex',alignItems:'center',gap:10},
  bubble:{background:D.accdim,border:`1px solid ${D.acc}44`,borderRadius:10,padding:'12px 16px',fontSize:13,lineHeight:1.6,color:D.txt,marginBottom:10},
};

const API_KEY = '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';
const API_HEADERS = {'Content-Type':'application/json','x-api-key':API_KEY,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'};
const MODEL = 'claude-sonnet-4-5';

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const store = {
  get:(k,def)=>{try{const v=localStorage.getItem(k);return v!=null?JSON.parse(v):def;}catch{return def;}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}}
};

// Session-level cache (clears when tab closes, persists while open)
const SESSION_KEY = 'forge_session_cache';
function getSessionCache() { try{return JSON.parse(sessionStorage.getItem(SESSION_KEY)||'{}')}catch{return{}} }
function setSessionCache(k,v) { try{const c=getSessionCache();c[k]=v;sessionStorage.setItem(SESSION_KEY,JSON.stringify(c))}catch{} }

// ─── EXERCISE LIBRARY ─────────────────────────────────────────────────────────
const DEFAULT_LIBRARY = [
  {name:'Barbell Squat',group:'Legs',type:'weight_reps'},{name:'Romanian Deadlift',group:'Legs',type:'weight_reps'},
  {name:'Leg Press',group:'Legs',type:'weight_reps'},{name:'Leg Curl',group:'Legs',type:'weight_reps'},
  {name:'Leg Extension',group:'Legs',type:'weight_reps'},{name:'Walking Lunge',group:'Legs',type:'weight_reps'},
  {name:'Bulgarian Split Squat',group:'Legs',type:'weight_reps'},{name:'Calf Raise',group:'Legs',type:'weight_reps'},
  {name:'Deadlift',group:'Back',type:'weight_reps'},{name:'Barbell Row',group:'Back',type:'weight_reps'},
  {name:'Pull-Up',group:'Back',type:'bodyweight_reps'},{name:'Lat Pulldown',group:'Back',type:'weight_reps'},
  {name:'Cable Row',group:'Back',type:'weight_reps'},{name:'Dumbbell Row',group:'Back',type:'weight_reps'},
  {name:'Barbell Bench Press',group:'Chest',type:'weight_reps'},{name:'Incline Bench Press',group:'Chest',type:'weight_reps'},
  {name:'Dumbbell Fly',group:'Chest',type:'weight_reps'},{name:'Cable Crossover',group:'Chest',type:'weight_reps'},
  {name:'Dip',group:'Chest',type:'bodyweight_reps'},{name:'Overhead Press',group:'Shoulders',type:'weight_reps'},
  {name:'Lateral Raise',group:'Shoulders',type:'weight_reps'},{name:'Front Raise',group:'Shoulders',type:'weight_reps'},
  {name:'Face Pull',group:'Shoulders',type:'weight_reps'},{name:'Barbell Curl',group:'Arms/Biceps',type:'weight_reps'},
  {name:'Dumbbell Curl',group:'Arms/Biceps',type:'weight_reps'},{name:'Hammer Curl',group:'Arms/Biceps',type:'weight_reps'},
  {name:'Tricep Pushdown',group:'Arms/Triceps',type:'weight_reps'},{name:'Skull Crusher',group:'Arms/Triceps',type:'weight_reps'},
  {name:'Close-Grip Bench',group:'Arms/Triceps',type:'weight_reps'},{name:'Plank',group:'Core',type:'time'},
  {name:'Cable Crunch',group:'Core',type:'weight_reps'},{name:'Ab Wheel',group:'Core',type:'bodyweight_reps'},
  {name:'Running',group:'Cardio',type:'time_distance'},{name:'Cycling',group:'Cardio',type:'time_distance'},
  {name:'Row Machine',group:'Cardio',type:'time_distance'},
];

const GROUP_OPTS = ['Chest','Back','Shoulders','Arms/Biceps','Arms/Triceps','Legs','Glutes','Core','Full Body','Cardio'];
const TYPE_OPTS = ['weight_reps','bodyweight_reps','time','distance','time_distance'];
const typeLabel = t=>({weight_reps:'Weight / Reps',bodyweight_reps:'Bodyweight / Reps',time:'Time',distance:'Distance',time_distance:'Time + Distance'}[t]||t);
const GOAL_OPTS = ['Hypertrophy','Strength','Power','Endurance','Maintenance','Cutting','Bulking','Athletic Performance','Mobility & Flexibility'];
const GOAL_COLORS = {Hypertrophy:D.pur,Strength:D.acc,Power:D.warn,Endurance:D.ok,Maintenance:D.mut,Cutting:D.err,Bulking:D.pur,'Athletic Performance':D.acc,'Mobility & Flexibility':D.ok};
const SCREENS = ['Dashboard','Log','Coach','Body','Goals','Profile'];

// ─── BMR CALCULATION ─────────────────────────────────────────────────────────
function calcBF(pinches, sites, age, gender) {
  const total = sites.reduce((s,k)=>s+(parseFloat(pinches[k])||0),0);
  if(total===0) return null;
  // Jackson-Pollock 7-site (gender-specific)
  if(gender==='female') {
    // JP formula for women
    const bd = 1.097 - (0.00046971*total) + (0.00000056*total*total) - (0.00012828*age);
    return (4.95/bd - 4.50)*100;
  }
  // JP formula for men
  const bd = 1.10938 - (0.0008267*total) + (0.0000016*total*total) - (0.0002574*age);
  return (4.95/bd - 4.50)*100;
}

function calcBMR(weightLb, heightCm, age, gender, leanLb) {
  // Katch-McArdle if lean mass known, else Mifflin-St Jeor
  if(leanLb) return Math.round(370 + 21.6*(leanLb*0.453592));
  const weightKg = weightLb*0.453592;
  if(gender==='female') return Math.round((10*weightKg)+(6.25*heightCm)-(5*age)-161);
  return Math.round((10*weightKg)+(6.25*heightCm)-(5*age)+5);
}

// ─── APP STATE ────────────────────────────────────────────────────────────────
function useAppState() {
  const [library,setLibrary] = useState(()=>store.get('forge_library',DEFAULT_LIBRARY));
  const [sessions,setSessions] = useState(()=>store.get('forge_sessions',[]));
  const [goals,setGoals] = useState(()=>store.get('forge_goals',{selected:['Strength','Hypertrophy'],primary:'Strength',weeks:'12',level:'Intermediate (2–5 yrs)',notes:''}));
  const [bodyLog,setBodyLog] = useState(()=>store.get('forge_body',[]));
  const [formAnalyses,setFormAnalyses] = useState(()=>store.get('forge_analyses',[]));
  const [profile,setProfile] = useState(()=>store.get('forge_profile',{name:'',age:'',gender:'male',heightFt:'',heightIn:'',units:'imperial'}));

  const saveLibrary = v=>{setLibrary(v);store.set('forge_library',v);};
  const saveSessions = fn=>{setSessions(prev=>{const v=typeof fn==='function'?fn(prev):fn;store.set('forge_sessions',v);return v;});};
  const saveGoals = v=>{setGoals(v);store.set('forge_goals',v);};
  const saveBodyLog = fn=>{setBodyLog(prev=>{const v=typeof fn==='function'?fn(prev):fn;store.set('forge_body',v);return v;});};
  const saveFormAnalyses = fn=>{setFormAnalyses(prev=>{const v=typeof fn==='function'?fn(prev):fn;store.set('forge_analyses',v);return v;});};
  const saveProfile = v=>{setProfile(v);store.set('forge_profile',v);};

  return {library,saveLibrary,sessions,saveSessions,goals,saveGoals,bodyLog,saveBodyLog,formAnalyses,saveFormAnalyses,profile,saveProfile};
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({sessions,goals,bodyLog,setScreen}) {
  const [expandedSession,setExpandedSession] = useState(null);
  const last5 = sessions.slice(-5).reverse();

  const liftTrends = {};
  sessions.forEach(s=>s.exercises.forEach(ex=>{
    const best=ex.sets.reduce((b,st)=>Math.max(b,parseFloat(st.w)||0),0);
    if(!liftTrends[ex.name])liftTrends[ex.name]=[];
    liftTrends[ex.name].push(best);
  }));
  const trendItems = Object.entries(liftTrends).slice(0,6).map(([name,vals])=>{
    const latest=vals[vals.length-1],prev=vals[vals.length-2];
    const pct=prev&&prev>0?((latest-prev)/prev*100).toFixed(1):null;
    const st=pct==null?'mut':parseFloat(pct)>0?'ok':parseFloat(pct)<0?'err':'warn';
    return {name,val:latest+' lb',trend:pct==null?'New':parseFloat(pct)>0?'+'+pct+'%':pct+'%',st};
  });

  const latestBody = bodyLog.length?bodyLog[bodyLog.length-1]:null;

  return e(Fragment,null,
    e('div',{style:{marginBottom:20}},
      e('div',{style:{fontSize:20,fontWeight:700,letterSpacing:2}},'DASHBOARD'),
      e('div',{style:{fontSize:12,color:D.mut,marginTop:2}},new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}))),
    sessions.length===0&&e('div',{style:{...css.card,textAlign:'center',padding:32,borderColor:D.acc+'44'}},
      e('div',{style:{fontSize:15,color:D.mut,marginBottom:12}},'No sessions logged yet'),
      e('button',{style:css.btn('pri'),onClick:()=>setScreen(1)},'Log Your First Workout →')),
    sessions.length>0&&e(Fragment,null,
      e('div',{style:{...css.g4,marginBottom:16}},
        e('div',{style:css.metric},e('div',{style:{fontSize:22,fontWeight:700,color:D.acc}},sessions.length),e('div',{style:{fontSize:11,color:D.mut,textTransform:'uppercase',marginTop:2}},'Sessions')),
        e('div',{style:css.metric},e('div',{style:{fontSize:22,fontWeight:700,color:D.ok}},sessions.reduce((t,s)=>t+s.exercises.reduce((tt,ex)=>tt+ex.sets.length,0),0)),e('div',{style:{fontSize:11,color:D.mut,textTransform:'uppercase',marginTop:2}},'Total Sets')),
        latestBody&&e('div',{style:css.metric},e('div',{style:{fontSize:22,fontWeight:700,color:D.pur}},latestBody.bf?latestBody.bf.toFixed(1)+'%':'—'),e('div',{style:{fontSize:11,color:D.mut,textTransform:'uppercase',marginTop:2}},'Body Fat')),
        latestBody&&e('div',{style:css.metric},e('div',{style:{fontSize:22,fontWeight:700,color:D.warn}},latestBody.weight?latestBody.weight+' lb':'—'),e('div',{style:{fontSize:11,color:D.mut,textTransform:'uppercase',marginTop:2}},'Weight'))),
      trendItems.length>0&&e('div',{style:css.card},
        e('div',{style:css.cardTitle},'Lift Trends'),
        trendItems.map(l=>e('div',{key:l.name,style:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 0',borderBottom:`1px solid ${D.bdr}`}},
          e('div',{style:{fontSize:13,fontWeight:500}},l.name),
          e('div',{style:{display:'flex',gap:8,alignItems:'center'}},
            e('span',{style:{fontSize:12,color:D.mut}},l.val),
            e('span',{style:css.badge(D[l.st]||D.mut)},l.trend))))),
      e('div',{style:css.card},
        e('div',{style:{...css.row,justifyContent:'space-between',marginBottom:12}},
          e('div',{style:css.cardTitle},'Session History'),
          e('div',{style:{fontSize:11,color:D.mut}},sessions.length+' total')),
        last5.map((s,i)=>e('div',{key:s.id||i},
          e('div',{style:{padding:'10px 0',borderBottom:`1px solid ${D.bdr}`,cursor:'pointer'},onClick:()=>setExpandedSession(expandedSession===i?null:i)},
            e('div',{style:{...css.row,justifyContent:'space-between'}},
              e('div',null,
                e('div',{style:{fontSize:13,fontWeight:500}},new Date(s.date).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})+' · '+s.timeOfDay),
                e('div',{style:{fontSize:11,color:D.mut,marginTop:2}},s.exercises.map(ex=>ex.name).join(', '))),
              e('div',{style:{display:'flex',gap:8,alignItems:'center'}},
                e('span',{style:css.badge(D.acc)},s.exercises.length+' ex'),
                e('span',{style:{color:D.mut,fontSize:14}},expandedSession===i?'▲':'▼'))),
          expandedSession===i&&e('div',{style:{marginTop:10,paddingTop:10,borderTop:`1px solid ${D.faint}`}},
            s.sessionNote&&e('div',{style:{fontSize:12,color:D.mut,marginBottom:8,fontStyle:'italic'}},'Note: '+s.sessionNote),
            s.exercises.map((ex,ei)=>e('div',{key:ei,style:{marginBottom:10}},
              e('div',{style:{fontSize:13,fontWeight:600,color:D.acc,marginBottom:4}},ex.name+' ',e('span',{style:{fontSize:11,color:D.mut,fontWeight:400}},ex.group)),
              e('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))',gap:4}},
                ex.sets.filter(st=>st.w||st.r).map((st,si)=>e('div',{key:si,style:{background:D.sur,borderRadius:6,padding:'4px 8px',fontSize:12}},
                  'Set '+(si+1)+': '+[st.w&&st.w+'lb',st.r&&st.r+'r',st.rest&&st.rest+'s rest'].filter(Boolean).join(' · '),
                  st.note&&e('div',{style:{fontSize:11,color:D.mut,marginTop:2}},st.note))))))))))));
}

// ─── LOG ──────────────────────────────────────────────────────────────────────
function WorkoutLog({library,saveLibrary,saveSessions,setScreen,sessions}) {
  const cacheKey = 'active_workout';
  const cached = getSessionCache()[cacheKey];

  const [exercises,setExercises] = useState(cached?.exercises||[]);
  const [sessNote,setSessNote] = useState(cached?.sessNote||'');
  const [showAdd,setShowAdd] = useState(false);
  const [showNewEx,setShowNewEx] = useState(false);
  const [selectedEx,setSelectedEx] = useState('');
  const [newEx,setNewEx] = useState({name:'',group:'Chest',type:'weight_reps'});
  const [saved,setSaved] = useState(false);
  const timers = useRef({});
  const startTime = useRef(cached?.startTime||Date.now());

  // Persist in-progress workout to sessionStorage
  useEffect(()=>{
    setSessionCache(cacheKey,{exercises,sessNote,startTime:startTime.current});
  },[exercises,sessNote]);

  const now = new Date(), hour = now.getHours();
  const timeOfDay = hour<10?'Early AM (Fasted)':hour<13?'Morning':hour<17?'Afternoon':'Evening';
  const fedState = hour<10||hour<13?'likely fasted':'likely fed';

  // Get last logged data for an exercise
  function getLastLog(exName) {
    for(let i=sessions.length-1;i>=0;i--) {
      const found = sessions[i].exercises.find(ex=>ex.name===exName);
      if(found&&found.sets.length>0) {
        const sets = found.sets.filter(s=>s.w||s.r);
        if(sets.length>0) return sets;
      }
    }
    return null;
  }

  function addExerciseToLog() {
    const ex = showNewEx ? newEx : library.find(l=>l.name===selectedEx)||null;
    if(!ex||!ex.name)return;
    if(showNewEx&&!library.find(l=>l.name===ex.name)) saveLibrary([...library,{name:ex.name,group:ex.group,type:ex.type}]);
    const lastLog = getLastLog(ex.name);
    const newEntry = {id:Date.now(),name:ex.name,group:ex.group,type:ex.type,lastLog,sets:[{w:'',r:'',rest:'',note:'',time:Date.now()}]};
    setExercises(prev=>[...prev,newEntry]);
    timers.current[exercises.length+'_last']=Date.now();
    setShowAdd(false);setShowNewEx(false);setSelectedEx('');setNewEx({name:'',group:'Chest',type:'weight_reps'});
  }

  function addSet(i) {
    const t=Date.now(),last=timers.current[i+'_last'];
    const autoRest=last?Math.max(0,Math.round((t-last)/1000)-12):'';
    timers.current[i+'_last']=t;
    setExercises(prev=>prev.map((ex,idx)=>idx!==i?ex:{...ex,sets:[...ex.sets,{w:'',r:'',rest:autoRest,note:'',time:t}]}));
  }

  function delSet(ei,si){setExercises(prev=>prev.map((ex,i)=>i!==ei?ex:{...ex,sets:ex.sets.filter((_,j)=>j!==si)}));}
  function delExercise(i){setExercises(prev=>prev.filter((_,idx)=>idx!==i));}
  function upd(ei,si,f,v){setExercises(prev=>prev.map((ex,i)=>i!==ei?ex:{...ex,sets:ex.sets.map((s,j)=>j!==si?s:{...s,[f]:v})}));}

  function finishSession() {
    if(exercises.length===0){alert('Add at least one exercise before finishing.');return;}
    const session={id:Date.now(),date:new Date().toISOString(),timeOfDay,fedState,sessionNote:sessNote,duration:Math.round((Date.now()-startTime.current)/60000),exercises:exercises.map(ex=>({...ex,sets:ex.sets.filter(s=>s.w||s.r||s.rest)}))};
    saveSessions(prev=>[...(Array.isArray(prev)?prev:[]),session]);
    setSaved(true);
    setSessionCache(cacheKey,null);
    setTimeout(()=>{setExercises([]);setSessNote('');setSaved(false);startTime.current=Date.now();setScreen(0);},1200);
  }

  return e(Fragment,null,
    e('div',{style:{...css.row,justifyContent:'space-between',marginBottom:16}},
      e('div',null,
        e('div',{style:{fontSize:18,fontWeight:700,letterSpacing:2}},'LOG WORKOUT'),
        e('div',{style:{fontSize:11,color:D.acc,marginTop:2}},now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})+' · '+timeOfDay+' · '+fedState)),
      e('button',{style:css.btn('pri'),onClick:()=>setShowAdd(true)},'+ Add Exercise')),
    e('div',{style:css.card},
      e('label',{style:css.lbl},'Session Notes'),
      e('textarea',{style:{...css.ta,minHeight:44},placeholder:'e.g. Fasted, slept 5h, shoulder tightness…',value:sessNote,onChange:ev=>setSessNote(ev.target.value)})),
    exercises.map((ex,ei)=>e('div',{key:ex.id,style:css.card},
      e('div',{style:{...css.row,justifyContent:'space-between',marginBottom:6}},
        e('div',null,
          e('div',{style:{fontSize:15,fontWeight:600}},ex.name),
          e('div',{style:{fontSize:11,color:D.mut,marginTop:1}},ex.group+' · '+typeLabel(ex.type))),
        e('button',{style:{...css.btn('danger'),padding:'4px 10px',fontSize:11},onClick:()=>delExercise(ei)},'Remove')),
      ex.lastLog&&e('div',{style:{fontSize:11,color:D.mut,marginBottom:8,padding:'6px 10px',background:D.sur,borderRadius:6}},
        '↩ Last session: '+ex.lastLog.map((s,i)=>'Set '+(i+1)+': '+(s.w?s.w+'lb ':'')+( s.r?s.r+' reps':'')).join(' · ')),
      e('div',{style:{display:'grid',gridTemplateColumns:'28px 1fr 1fr 72px 1fr 24px',gap:5,marginBottom:5}},
        ['#','Weight','Reps','Rest(s)','Notes',''].map((h,i)=>e('div',{key:i,style:{fontSize:10,color:D.mut,letterSpacing:1,textTransform:'uppercase'}},h))),
      ex.sets.map((s,si)=>e('div',{key:si,style:{display:'grid',gridTemplateColumns:'28px 1fr 1fr 72px 1fr 24px',gap:5,marginBottom:5,alignItems:'center'}},
        e('div',{style:{fontSize:12,color:D.mut,textAlign:'center'}},si+1),
        e('input',{style:css.inp,type:'number',placeholder:'lb',value:s.w,onChange:ev=>upd(ei,si,'w',ev.target.value)}),
        e('input',{style:css.inp,type:'number',placeholder:'reps',value:s.r,onChange:ev=>upd(ei,si,'r',ev.target.value)}),
        e('input',{style:{...css.inp,background:s.rest?D.accdim:D.sur},type:'number',placeholder:'auto',value:s.rest,onChange:ev=>upd(ei,si,'rest',ev.target.value)}),
        e('input',{style:{...css.inp,fontSize:11},placeholder:'note…',value:s.note,onChange:ev=>upd(ei,si,'note',ev.target.value)}),
        e('button',{style:{background:'transparent',border:'none',color:D.err,cursor:'pointer',fontSize:18,padding:0,lineHeight:1},onClick:()=>delSet(ei,si)},'×'))),
      e('button',{style:{...css.btn('ghost'),fontSize:12,padding:'5px 12px',marginTop:4},onClick:()=>addSet(ei)},'+ Set'))),
    showAdd&&e('div',{style:{...css.card,border:`1px solid ${D.acc}55`}},
      e('div',{style:css.cardTitle},'Add Exercise'),
      !showNewEx&&e(Fragment,null,
        e('label',{style:css.lbl},'Choose from library'),
        e('select',{style:{...css.sel,marginBottom:10},value:selectedEx,onChange:ev=>setSelectedEx(ev.target.value)},
          e('option',{value:''},'— Select exercise —'),
          GROUP_OPTS.map(g=>{
            const exs=library.filter(l=>l.group===g);
            if(!exs.length)return null;
            return e(Fragment,{key:g},
              e('option',{disabled:true},'── '+g+' ──'),
              exs.map(l=>e('option',{key:l.name,value:l.name},l.name)));
          })),
        e('div',{style:{...css.row,flexWrap:'wrap',gap:8}},
          e('button',{style:css.btn('pri'),onClick:addExerciseToLog},'Add to Session'),
          e('button',{style:{...css.btn('ghost'),fontSize:12},onClick:()=>setShowNewEx(true)},'+ Create New'),
          e('button',{style:css.btn('ghost'),onClick:()=>setShowAdd(false)},'Cancel'))),
      showNewEx&&e(Fragment,null,
        e('div',{style:css.g3},
          e('div',null,e('label',{style:css.lbl},'Name'),e('input',{style:css.inp,placeholder:'e.g. Hack Squat',value:newEx.name,onChange:ev=>setNewEx({...newEx,name:ev.target.value})})),
          e('div',null,e('label',{style:css.lbl},'Muscle Group'),e('select',{style:css.sel,value:newEx.group,onChange:ev=>setNewEx({...newEx,group:ev.target.value})},GROUP_OPTS.map(g=>e('option',{key:g},g)))),
          e('div',null,e('label',{style:css.lbl},'Type'),e('select',{style:css.sel,value:newEx.type,onChange:ev=>setNewEx({...newEx,type:ev.target.value})},TYPE_OPTS.map(t=>e('option',{key:t,value:t},typeLabel(t)))))),
        e('div',{style:{...css.row,marginTop:10,flexWrap:'wrap',gap:8}},
          e('button',{style:css.btn('pri'),onClick:addExerciseToLog},'Create & Add'),
          e('button',{style:{...css.btn('ghost'),fontSize:12},onClick:()=>setShowNewEx(false)},'← Back'),
          e('button',{style:css.btn('ghost'),onClick:()=>{setShowAdd(false);setShowNewEx(false);}},'Cancel')))),
    saved
      ?e('div',{style:{...css.btn('pri'),width:'100%',padding:14,fontSize:14,letterSpacing:2,marginTop:8,textAlign:'center',background:D.ok,borderRadius:7}},'✓ SESSION SAVED')
      :e('button',{style:{...css.btn('pri'),width:'100%',padding:14,fontSize:14,letterSpacing:2,marginTop:8},onClick:finishSession},'FINISH & SAVE SESSION →'));
}

// ─── COACH ────────────────────────────────────────────────────────────────────
function Coach({sessions,goals,bodyLog,profile,formAnalyses,saveFormAnalyses}) {
  const [msgs,setMsgs] = useState(()=>getSessionCache()['coach_msgs']||[{role:'assistant',text:'Hi! I\'m your FORGE AI Coach. I have access to all your logged sessions, body composition, goals, and profile. Ask me anything about training, programming, recovery, or nutrition.'}]);
  const [inp,setInp] = useState('');
  const [loading,setLoading] = useState(false);
  const [analyzing,setAnalyzing] = useState(false);
  const chatRef = useRef(null);

  useEffect(()=>{if(chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight;},[msgs]);
  useEffect(()=>{setSessionCache('coach_msgs',msgs);},[msgs]);

  function buildContext() {
    const latestBody=bodyLog.length?bodyLog[bodyLog.length-1]:null;
    const liftHistory={};
    sessions.forEach(s=>s.exercises.forEach(ex=>{
      if(!liftHistory[ex.name])liftHistory[ex.name]=[];
      const best=ex.sets.reduce((b,st)=>Math.max(b,parseFloat(st.w)||0),0);
      liftHistory[ex.name].push({date:s.date,weight:best,sets:ex.sets.length,timeOfDay:s.timeOfDay,fedState:s.fedState});
    }));
    const stalls=Object.entries(liftHistory).filter(([,v])=>{
      if(v.length<3)return false;
      const last3=v.slice(-3).map(x=>x.weight);
      return last3.every(w=>w===last3[0]&&w>0);
    }).map(([n])=>n);

    const heightCm = profile.heightFt?Math.round((parseInt(profile.heightFt||0)*12+parseInt(profile.heightIn||0))*2.54):null;

    return `You are FORGE, an elite AI fitness coach (CSCS-level). You have the user's full training data.

PROFILE: ${JSON.stringify({...profile,heightCm})}
GOALS: ${JSON.stringify(goals)}
SESSIONS (last 10): ${JSON.stringify(sessions.slice(-10).map(s=>({date:s.date,timeOfDay:s.timeOfDay,fedState:s.fedState,note:s.sessionNote,exercises:s.exercises.map(ex=>({name:ex.name,group:ex.group,sets:ex.sets.map(st=>({w:st.w,r:st.r,rest:st.rest,note:st.note}))}))}))).slice(0,4000)}
LIFT HISTORY: ${JSON.stringify(Object.fromEntries(Object.entries(liftHistory).map(([k,v])=>[k,v.slice(-5)]))).slice(0,2000)}
STALLED LIFTS: ${stalls.join(', ')||'None'}
BODY COMP: ${latestBody?JSON.stringify(latestBody):'Not logged'}
FORM ANALYSES: ${JSON.stringify(formAnalyses.slice(-3))}
TOTAL SESSIONS: ${sessions.length}

Be specific, science-backed, and actionable. Reference actual data. Note fasted/fed patterns. Cite Schoenfeld, Israetel etc when relevant. Be concise.`;
  }

  async function send() {
    if(!inp.trim()||loading)return;
    const txt=inp.trim(); setInp('');
    const newMsgs=[...msgs,{role:'user',text:txt}];
    setMsgs(newMsgs); setLoading(true);
    try {
      const res=await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',headers:API_HEADERS,
        body:JSON.stringify({model:MODEL,max_tokens:1024,system:buildContext(),messages:newMsgs.map(m=>({role:m.role,content:m.text}))})
      });
      const data=await res.json();
      if(data.error)setMsgs(m=>[...m,{role:'assistant',text:'API Error: '+data.error.message}]);
      else setMsgs(m=>[...m,{role:'assistant',text:data.content?.[0]?.text||'No response.'}]);
    } catch(err){setMsgs(m=>[...m,{role:'assistant',text:'Network error: '+err.message}]);}
    setLoading(false);
  }

  async function analyzeVideo(file) {
    setAnalyzing(true);
    const reader=new FileReader();
    reader.onload=async()=>{
      try {
        const b64=reader.result.split(',')[1];
        const isImage=file.type.startsWith('image/');
        const content=isImage
          ?[{type:'image',source:{type:'base64',media_type:file.type,data:b64}},{type:'text',text:'Analyze this exercise form image. Identify: 1) Exercise performed, 2) Form strengths, 3) Form issues or compensation patterns, 4) Specific corrective cues, 5) Long-term coaching notes.'}]
          :[{type:'text',text:'The user uploaded a video file named "'+file.name+'" for form analysis. Based on the filename and context, provide general form coaching notes and cues for this exercise, noting what to watch for. Ask them to describe what they noticed in their form for more specific feedback.'}];
        const res=await fetch('https://api.anthropic.com/v1/messages',{
          method:'POST',headers:API_HEADERS,
          body:JSON.stringify({model:MODEL,max_tokens:1024,messages:[{role:'user',content}]})
        });
        const data=await res.json();
        const text=data.content?.[0]?.text||'Could not analyze.';
        const analysis={date:new Date().toISOString(),filename:file.name,analysis:text};
        saveFormAnalyses(prev=>[...prev,analysis]);
        setMsgs(m=>[...m,{role:'assistant',text:'✓ Analysis for "'+file.name+'":\n\n'+text}]);
      } catch(err){setMsgs(m=>[...m,{role:'assistant',text:'Analysis error: '+err.message}]);}
      setAnalyzing(false);
    };
    reader.readAsDataURL(file);
  }

  return e(Fragment,null,
    e('div',{style:{fontSize:18,fontWeight:700,letterSpacing:2,marginBottom:4}},'AI COACH'),
    e('div',{style:{fontSize:11,color:D.mut,marginBottom:16}},'Powered by your logged data · Science-backed'),
    e('div',{style:{...css.card,padding:'10px 16px',marginBottom:12}},
      e('div',{style:{fontSize:11,color:D.mut,marginBottom:6,letterSpacing:1,textTransform:'uppercase'}},'Context'),
      e('div',{style:{display:'flex',gap:8,flexWrap:'wrap'}},
        e('span',{style:css.badge(D.acc)},sessions.length+' sessions'),
        e('span',{style:css.badge(D.ok)},goals.primary||'No goal set'),
        profile.name&&e('span',{style:css.badge(D.mut)},profile.name),
        bodyLog.length?e('span',{style:css.badge(D.pur)},'Body comp logged'):null,
        formAnalyses.length?e('span',{style:css.badge(D.warn)},formAnalyses.length+' form analyses'):null)),
    e('div',{ref:chatRef,style:{...css.card,minHeight:300,maxHeight:440,overflowY:'auto',marginBottom:12}},
      msgs.map((m,i)=>e('div',{key:i,style:{marginBottom:14,display:'flex',flexDirection:m.role==='user'?'row-reverse':'row',gap:8}},
        e('div',{style:{width:28,height:28,borderRadius:6,background:m.role==='user'?D.faint:D.accdim,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,flexShrink:0,color:m.role==='user'?D.mut:D.acc,fontWeight:700}},m.role==='user'?'YOU':'AI'),
        e('div',{style:{background:m.role==='user'?D.sur:D.accdim,border:`1px solid ${m.role==='user'?D.bdr:D.acc+'44'}`,borderRadius:10,padding:'10px 14px',fontSize:13,lineHeight:1.7,maxWidth:'85%',whiteSpace:'pre-wrap'}},m.text))),
      loading&&e('div',{style:{color:D.mut,fontSize:13,padding:'8px 14px',fontStyle:'italic'}},'Analyzing…')),
    e('div',{style:{...css.card,marginBottom:12}},
      e('div',{style:{fontSize:11,color:D.mut,marginBottom:6,letterSpacing:1,textTransform:'uppercase'}},'Form Analysis — Upload Image or Video'),
      e('div',{style:{fontSize:11,color:D.mut,marginBottom:8}},'Upload a form photo or video. Analysis is stored as text; original file is not saved.'),
      e('input',{type:'file',accept:'video/*,image/*',style:{...css.inp,padding:'6px'},onChange:ev=>{if(ev.target.files[0])analyzeVideo(ev.target.files[0])},disabled:analyzing}),
      analyzing&&e('div',{style:{fontSize:12,color:D.acc,marginTop:6}},'Analyzing form…'),
      formAnalyses.length>0&&e(Fragment,null,
        e('div',{style:{...css.divider}}),
        e('div',{style:{fontSize:11,color:D.mut,marginBottom:6,letterSpacing:1,textTransform:'uppercase'}},'Past Analyses'),
        formAnalyses.slice().reverse().slice(0,3).map((a,i)=>e('div',{key:i,style:{borderTop:`1px solid ${D.bdr}`,paddingTop:8,marginTop:8}},
          e('div',{style:{...css.row,justifyContent:'space-between',marginBottom:4}},
            e('span',{style:css.badge(D.pur)},a.filename),
            e('span',{style:{fontSize:11,color:D.mut}},new Date(a.date).toLocaleDateString())),
          e('div',{style:{fontSize:12,color:D.txt,lineHeight:1.5,whiteSpace:'pre-wrap'}},a.analysis.slice(0,250)+'…'))))),
    e('div',{style:{...css.row,gap:8}},
      e('input',{style:{...css.inp,flex:1},placeholder:'Ask your coach… (e.g. Why is my squat stalling?)',value:inp,onChange:ev=>setInp(ev.target.value),onKeyDown:ev=>ev.key==='Enter'&&!ev.shiftKey&&send()}),
      e('button',{style:{...css.btn('pri'),flexShrink:0},onClick:send,disabled:loading},'→')));
}

// ─── BODY ────────────────────────────────────────────────────────────────────
function Body({bodyLog,saveBodyLog,profile}) {
  const cacheKey='body_form';
  const cached=getSessionCache()[cacheKey]||{};
  const [pts,setPts] = useState(cached.pts||7);
  const [pinches,setPinches] = useState(cached.pinches||{});
  const [meas,setMeas] = useState(cached.meas||{weight:'',chest:'',waist:'',hips:'',neck:'',leftArm:'',rightArm:'',leftThigh:'',rightThigh:'',calf:''});
  const [saved,setSaved] = useState(false);

  useEffect(()=>setSessionCache(cacheKey,{pts,pinches,meas}),[pts,pinches,meas]);

  const siteMap={7:['Chest','Abdomen','Suprailiac','Tricep','Subscapular','Midaxillary','Thigh'],5:['Chest','Abdomen','Suprailiac','Tricep','Thigh'],3:['Chest','Abdomen','Thigh']};
  const sites=siteMap[pts];
  const age=parseInt(profile.age)||35;
  const gender=profile.gender||'male';
  const bf=calcBF(pinches,sites,age,gender);
  const weight=parseFloat(meas.weight)||0;
  const lean=bf!=null&&weight>0?weight*(1-bf/100):null;
  const heightCm=profile.heightFt?Math.round((parseInt(profile.heightFt||0)*12+parseInt(profile.heightIn||0))*2.54):null;
  const bmr=(lean||weight)&&heightCm&&age?calcBMR(weight,heightCm,age,gender,lean):null;

  function saveEntry() {
    const entry={date:new Date().toISOString(),pts,pinches:{...pinches},measurements:{...meas},bf,lean,bmr,weight:parseFloat(meas.weight)||null};
    saveBodyLog(prev=>[...(Array.isArray(prev)?prev:[]),entry]);
    setSaved(true); setTimeout(()=>setSaved(false),2000);
  }

  return e(Fragment,null,
    e('div',{style:{fontSize:18,fontWeight:700,letterSpacing:2,marginBottom:8}},'BODY COMPOSITION'),
    (!profile.age||!profile.heightFt)&&e('div',{style:{...css.bubble,borderColor:D.warn+'66',background:D.warn+'11',marginBottom:16}},
      '⚠ Set your age, height, and gender in the Profile tab for accurate BMR and body fat calculations.'),
    e('div',{style:css.g2},
      e('div',{style:css.card},
        e('div',{style:css.cardTitle},'Caliper Pinches — Jackson-Pollock'),
        e('div',{style:{...css.row,marginBottom:12,gap:6}},[3,5,7].map(n=>e('button',{key:n,style:{...css.btn(pts===n?'pri':'ghost'),padding:'5px 14px',fontSize:12},onClick:()=>setPts(n)},n+'-Site'))),
        sites.map(s=>e('div',{key:s,style:{...css.row,marginBottom:8}},
          e('label',{style:{...css.lbl,margin:0,width:100,flexShrink:0}},s),
          e('input',{style:{...css.inp,width:80},type:'number',placeholder:'mm',value:pinches[s]||'',onChange:ev=>setPinches({...pinches,[s]:ev.target.value})}),
          e('span',{style:{fontSize:11,color:D.mut}},'mm'))),
        bf!=null&&e('div',{style:{marginTop:10,borderTop:`1px solid ${D.bdr}`,paddingTop:10}},
          e('div',{style:{...css.row,justifyContent:'space-between',marginBottom:4}},e('span',{style:{fontSize:12,color:D.mut}},'Est. Body Fat ('+gender+', age '+age+')'),e('span',{style:{fontSize:16,fontWeight:700,color:D.acc}},bf.toFixed(1)+'%')),
          lean&&e('div',{style:{...css.row,justifyContent:'space-between',marginBottom:4}},e('span',{style:{fontSize:12,color:D.mut}},'Lean Mass'),e('span',{style:{fontSize:14,fontWeight:600,color:D.ok}},lean.toFixed(1)+' lb')),
          bmr&&e('div',{style:{...css.row,justifyContent:'space-between'}},e('span',{style:{fontSize:12,color:D.mut}},lean?'BMR (Katch-McArdle)':'BMR (Mifflin-St Jeor)'),e('span',{style:{fontSize:14,fontWeight:600,color:D.warn}},bmr+' kcal/day')))),
      e('div',{style:css.card},
        e('div',{style:css.cardTitle},'Tape Measurements'),
        Object.entries(meas).map(([k,v])=>e('div',{key:k,style:{...css.row,marginBottom:8}},
          e('label',{style:{...css.lbl,margin:0,width:100,flexShrink:0,textTransform:'none',fontSize:12}},k.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase())),
          e('input',{style:{...css.inp,width:80},type:'number',step:'0.1',placeholder:'—',value:v,onChange:ev=>setMeas({...meas,[k]:ev.target.value})}),
          e('span',{style:{fontSize:11,color:D.mut}},k==='weight'?'lb':'in'))))),
    bmr&&e('div',{style:{...css.bubble,marginBottom:12}},
      e('strong',{style:{color:D.acc}},'Coach Nutrition Insight'),' — Lean mass: '+(lean?lean.toFixed(0)+' lb · ':'')+'BMR: '+bmr+' kcal · Sedentary maintenance: ~'+Math.round(bmr*1.2)+' kcal · Moderate activity: ~'+Math.round(bmr*1.55)+' kcal · Protein: '+(lean?Math.round(lean):Math.round(weight*0.8))+' g/day'),
    e('button',{style:{...css.btn(saved?'ghost':'pri'),width:'100%',padding:12,fontSize:14,letterSpacing:2,marginBottom:16},onClick:saveEntry},saved?'✓ Saved':'SAVE ENTRY →'),
    bodyLog.length>0&&e('div',{style:css.card},
      e('div',{style:css.cardTitle},'History'),
      bodyLog.slice().reverse().slice(0,6).map((h,i)=>e('div',{key:i,style:{padding:'7px 0',borderBottom:`1px solid ${D.bdr}`,display:'flex',justifyContent:'space-between',alignItems:'center'}},
        e('div',{style:{fontSize:12,color:D.mut}},new Date(h.date).toLocaleDateString()),
        e('div',{style:{display:'flex',gap:10}},
          h.weight&&e('span',{style:{fontSize:12}},h.weight+' lb'),
          h.bf!=null&&e('span',{style:{fontSize:12,color:D.acc}},h.bf.toFixed(1)+'% BF'),
          h.lean&&e('span',{style:{fontSize:12,color:D.ok}},h.lean.toFixed(0)+' lb lean'))))));
}

// ─── GOALS ───────────────────────────────────────────────────────────────────
function Goals({goals,saveGoals}) {
  const [local,setLocal] = useState({...goals});
  const [saved,setSaved] = useState(false);
  useEffect(()=>setSessionCache('goals_form',local),[local]);

  function save(){saveGoals(local);setSaved(true);setTimeout(()=>setSaved(false),2000);}
  const toggle=g=>setLocal(l=>({...l,selected:l.selected.includes(g)?l.selected.filter(x=>x!==g):[...l.selected,g]}));

  return e(Fragment,null,
    e('div',{style:{fontSize:18,fontWeight:700,letterSpacing:2,marginBottom:4}},'TRAINING GOALS'),
    e('div',{style:{fontSize:12,color:D.mut,marginBottom:16}},'These are injected into every AI Coach response.'),
    e('div',{style:css.card},
      e('div',{style:css.cardTitle},'Select Goals'),
      e('div',{style:{display:'flex',flexWrap:'wrap',gap:8,marginBottom:16}},
        GOAL_OPTS.map(g=>e('button',{key:g,onClick:()=>toggle(g),style:{background:local.selected.includes(g)?(GOAL_COLORS[g]||D.acc)+'22':D.sur,color:local.selected.includes(g)?GOAL_COLORS[g]||D.acc:D.mut,border:`1px solid ${local.selected.includes(g)?(GOAL_COLORS[g]||D.acc)+'66':D.bdr}`,borderRadius:8,padding:'8px 14px',fontSize:13,cursor:'pointer'}},g+(local.selected.includes(g)?' ✓':'')))),
      local.selected.length>1&&e('div',{style:{marginBottom:12}},
        e('label',{style:css.lbl},'Primary Priority'),
        e('select',{style:css.sel,value:local.primary,onChange:ev=>setLocal({...local,primary:ev.target.value})},local.selected.map(g=>e('option',{key:g},g)))),
      e('div',{style:{...css.g2,marginBottom:12}},
        e('div',null,e('label',{style:css.lbl},'Timeframe (weeks)'),e('input',{style:css.inp,type:'number',value:local.weeks,onChange:ev=>setLocal({...local,weeks:ev.target.value})})),
        e('div',null,e('label',{style:css.lbl},'Experience Level'),e('select',{style:css.sel,value:local.level,onChange:ev=>setLocal({...local,level:ev.target.value})},['Beginner (<2 yrs)','Intermediate (2–5 yrs)','Advanced (5+ yrs)'].map(l=>e('option',{key:l},l))))),
      e('div',{style:{marginBottom:12}},
        e('label',{style:css.lbl},'Context for your coach'),
        e('textarea',{style:{...css.ta,minHeight:60},placeholder:'e.g. Powerlifting meet in 12 weeks, nagging left shoulder, shift worker schedule…',value:local.notes,onChange:ev=>setLocal({...local,notes:ev.target.value})})),
      e('button',{style:{...css.btn(saved?'ghost':'pri'),padding:'10px 24px'},onClick:save},saved?'✓ Saved':'Save Goals →')),
    local.selected.length>0&&e('div',{style:css.bubble},
      e('strong',{style:{color:D.acc}},'Active Coach Profile'),' — Primary: '+local.primary+' · Secondary: '+(local.selected.filter(s=>s!==local.primary).join(', ')||'none')+' · '+local.weeks+' wk · '+local.level+(local.notes?'\n\nContext: '+local.notes:'')));
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────
function Profile({profile,saveProfile}) {
  const [local,setLocal] = useState({...profile});
  const [saved,setSaved] = useState(false);
  useEffect(()=>setSessionCache('profile_form',local),[local]);

  function save(){saveProfile(local);setSaved(true);setTimeout(()=>setSaved(false),2000);}

  const heightCm=local.heightFt?Math.round((parseInt(local.heightFt||0)*12+parseInt(local.heightIn||0))*2.54):null;
  const weightKg=local.weight?Math.round(parseFloat(local.weight)*0.453592*10)/10:null;

  return e(Fragment,null,
    e('div',{style:{fontSize:18,fontWeight:700,letterSpacing:2,marginBottom:4}},'PROFILE'),
    e('div',{style:{fontSize:12,color:D.mut,marginBottom:16}},'Used for accurate BMR, body fat, and personalized coaching.'),
    e('div',{style:css.card},
      e('div',{style:css.cardTitle},'Personal Info'),
      e('div',{style:{...css.g2,marginBottom:12}},
        e('div',null,e('label',{style:css.lbl},'Name'),e('input',{style:css.inp,placeholder:'Your name',value:local.name||'',onChange:ev=>setLocal({...local,name:ev.target.value})})),
        e('div',null,e('label',{style:css.lbl},'Age'),e('input',{style:css.inp,type:'number',placeholder:'e.g. 30',value:local.age||'',onChange:ev=>setLocal({...local,age:ev.target.value})}))),
      e('div',{style:{marginBottom:12}},
        e('label',{style:css.lbl},'Biological Sex (for body comp formulas)'),
        e('div',{style:{...css.row,gap:8}},
          ['male','female'].map(g=>e('button',{key:g,style:{...css.btn(local.gender===g?'pri':'ghost'),padding:'7px 20px',fontSize:13},onClick:()=>setLocal({...local,gender:g})},g.charAt(0).toUpperCase()+g.slice(1))))),
      e('div',{style:{marginBottom:12}},
        e('label',{style:css.lbl},'Height'),
        e('div',{style:{...css.row,gap:8}},
          e('input',{style:{...css.inp,width:70},type:'number',placeholder:'ft',value:local.heightFt||'',onChange:ev=>setLocal({...local,heightFt:ev.target.value})}),
          e('span',{style:{fontSize:13,color:D.mut}},'ft'),
          e('input',{style:{...css.inp,width:70},type:'number',placeholder:'in',value:local.heightIn||'',onChange:ev=>setLocal({...local,heightIn:ev.target.value})}),
          e('span',{style:{fontSize:13,color:D.mut}},'in'),
          heightCm&&e('span',{style:{fontSize:12,color:D.mut}},'= '+heightCm+' cm'))),
      e('div',{style:{marginBottom:16}},
        e('label',{style:css.lbl},'Activity Level'),
        e('select',{style:css.sel,value:local.activity||'moderate',onChange:ev=>setLocal({...local,activity:ev.target.value})},
          [['sedentary','Sedentary (desk job, no exercise)'],['light','Lightly active (1–3 days/wk)'],['moderate','Moderately active (3–5 days/wk)'],['active','Very active (6–7 days/wk)'],['athlete','Athlete (2x/day training)']].map(([v,l])=>e('option',{key:v,value:v},l)))),
      e('button',{style:{...css.btn(saved?'ghost':'pri'),padding:'10px 24px'},onClick:save},saved?'✓ Profile Saved':'Save Profile →')),
    local.name&&e('div',{style:css.bubble},
      e('strong',{style:{color:D.acc}},local.name),
      ' · '+(local.age?'Age '+local.age:'')+' · '+(local.gender||'')+
      (heightCm?' · '+local.heightFt+'\''+local.heightIn+'" ('+heightCm+' cm)':'')+
      (local.activity?' · '+local.activity+' activity':'')));
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
const VIEWS = [Dashboard, WorkoutLog, Coach, Body, Goals, Profile];

function App() {
  const [screen,setScreen] = useState(0);
  const state = useAppState();

  const props = {
    0:{sessions:state.sessions,goals:state.goals,bodyLog:state.bodyLog,setScreen},
    1:{library:state.library,saveLibrary:state.saveLibrary,saveSessions:state.saveSessions,setScreen,sessions:state.sessions},
    2:{sessions:state.sessions,goals:state.goals,bodyLog:state.bodyLog,profile:state.profile,formAnalyses:state.formAnalyses,saveFormAnalyses:state.saveFormAnalyses},
    3:{bodyLog:state.bodyLog,saveBodyLog:state.saveBodyLog,profile:state.profile},
    4:{goals:state.goals,saveGoals:state.saveGoals},
    5:{profile:state.profile,saveProfile:state.saveProfile},
  };

  return e('div',{style:css.app},
    e('nav',{style:css.nav},
      e('div',null,e('span',{style:css.logo},'FORGE'),e('span',{style:css.logoSub},'INTELLIGENT TRAINING')),
      e('div',{style:{display:'flex',gap:2,flexWrap:'wrap'}},
        SCREENS.map((s,i)=>e('button',{key:s,style:css.tab(screen===i),onClick:()=>setScreen(i)},s.toUpperCase())))),
    e('div',{style:css.body},e(VIEWS[screen],props[screen])));
}

createRoot(document.getElementById('root')).render(e(App,null));
export default App;
