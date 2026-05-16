import { useState, useRef, useEffect, useCallback } from 'https://esm.sh/react@18';
import { createElement as e, Fragment } from 'https://esm.sh/react@18';
import { createRoot } from 'https://esm.sh/react-dom@18/client';

var D = {
  bg:'#0e0f11', sur:'#16181c', card:'#1c1f26', bdr:'#2a2d36',
  acc:'#4a9eff', accdim:'#1a3a5c', txt:'#e8eaf0', mut:'#6b7280',
  faint:'#3a3d47', ok:'#34d399', warn:'#fbbf24', err:'#f87171', pur:'#a78bfa'
};

var css = {
  app: {background:D.bg, minHeight:'100vh', color:D.txt, fontFamily:"'Inter',system-ui,sans-serif", display:'flex', flexDirection:'column'},
  nav: {background:D.sur, borderBottom:'1px solid '+D.bdr, padding:'0 16px', display:'flex', alignItems:'center', justifyContent:'space-between', minHeight:56, flexShrink:0, gap:8, flexWrap:'wrap'},
  logo: {fontSize:18, fontWeight:700, letterSpacing:4, color:D.txt},
  logoSub: {fontSize:9, letterSpacing:3, color:D.mut, display:'block', marginTop:-4},
  body: {flex:1, padding:'20px', maxWidth:900, margin:'0 auto', width:'100%', boxSizing:'border-box'},
  card: {background:D.card, border:'1px solid '+D.bdr, borderRadius:12, padding:'16px 20px', marginBottom:16},
  cardTitle: {fontSize:11, fontWeight:600, letterSpacing:2, color:D.mut, textTransform:'uppercase', marginBottom:12},
  g2: {display:'grid', gridTemplateColumns:'1fr 1fr', gap:12},
  g3: {display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12},
  g4: {display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:10},
  metric: {background:D.sur, borderRadius:8, padding:'12px 14px', border:'1px solid '+D.bdr},
  inp: {background:D.sur, border:'1px solid '+D.bdr, borderRadius:7, padding:'8px 12px', fontSize:13, color:D.txt, width:'100%', outline:'none', boxSizing:'border-box'},
  sel: {background:D.sur, border:'1px solid '+D.bdr, borderRadius:7, padding:'8px 12px', fontSize:13, color:D.txt, width:'100%', outline:'none', boxSizing:'border-box'},
  ta: {background:D.sur, border:'1px solid '+D.bdr, borderRadius:7, padding:'8px 12px', fontSize:13, color:D.txt, width:'100%', outline:'none', boxSizing:'border-box', resize:'vertical', fontFamily:'inherit'},
  lbl: {fontSize:11, color:D.mut, letterSpacing:1, textTransform:'uppercase', marginBottom:4, display:'block'},
  divider: {borderTop:'1px solid '+D.bdr, margin:'14px 0'},
  row: {display:'flex', alignItems:'center', gap:10},
  bubble: {background:D.accdim, border:'1px solid '+D.acc+'44', borderRadius:10, padding:'12px 16px', fontSize:13, lineHeight:1.6, color:D.txt, marginBottom:10},
};

function tab(a) {
  return {background:a?D.accdim:'transparent', color:a?D.acc:D.mut, border:'none', borderRadius:6, padding:'6px 10px', fontSize:11, fontWeight:500, cursor:'pointer', letterSpacing:1};
}
function badge(c) {
  return {background:c+'22', color:c, fontSize:10, fontWeight:600, letterSpacing:1, padding:'3px 8px', borderRadius:4, textTransform:'uppercase', border:'1px solid '+c+'44', display:'inline-block'};
}
function btn(v) {
  if(v==='pri') return {background:D.acc, color:'#fff', border:'none', borderRadius:7, padding:'8px 16px', fontSize:13, fontWeight:500, cursor:'pointer'};
  if(v==='danger') return {background:D.err+'22', color:D.err, border:'1px solid '+D.err+'44', borderRadius:7, padding:'8px 16px', fontSize:13, fontWeight:500, cursor:'pointer'};
  return {background:'transparent', color:D.acc, border:'1px solid '+D.bdr, borderRadius:7, padding:'8px 16px', fontSize:13, fontWeight:500, cursor:'pointer'};
}
function metricVal(c) { return {fontSize:22, fontWeight:700, color:c}; }
function metricLbl() { return {fontSize:11, color:D.mut, textTransform:'uppercase', marginTop:2, letterSpacing:1}; }

var API_ENDPOINT = '/.netlify/functions/coach';
var MODEL = 'claude-sonnet-4-5';

// Storage
var store = {
  get: function(k, def) { try { var v=localStorage.getItem(k); return v!=null?JSON.parse(v):def; } catch(e) { return def; } },
  set: function(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} }
};
function getSC() { try { return JSON.parse(sessionStorage.getItem('forge_sc')||'{}'); } catch(e) { return {}; } }
function setSC(k, v) { try { var c=getBC(); c[k]=v; sessionStorage.setItem('forge_sc', JSON.stringify(c)); } catch(e) {} }
function getBC() { try { return JSON.parse(sessionStorage.getItem('forge_sc')||'{}'); } catch(e) { return {}; } }

var DEFAULT_LIBRARY = [
  {name:'Barbell Squat',group:'Legs',type:'weight_reps'},
  {name:'Romanian Deadlift',group:'Legs',type:'weight_reps'},
  {name:'Leg Press',group:'Legs',type:'weight_reps'},
  {name:'Leg Curl',group:'Legs',type:'weight_reps'},
  {name:'Bulgarian Split Squat',group:'Legs',type:'weight_reps'},
  {name:'Calf Raise',group:'Legs',type:'weight_reps'},
  {name:'Deadlift',group:'Back',type:'weight_reps'},
  {name:'Barbell Row',group:'Back',type:'weight_reps'},
  {name:'Pull-Up',group:'Back',type:'bodyweight_reps'},
  {name:'Lat Pulldown',group:'Back',type:'weight_reps'},
  {name:'Cable Row',group:'Back',type:'weight_reps'},
  {name:'Barbell Bench Press',group:'Chest',type:'weight_reps'},
  {name:'Incline Bench Press',group:'Chest',type:'weight_reps'},
  {name:'Dumbbell Fly',group:'Chest',type:'weight_reps'},
  {name:'Dip',group:'Chest',type:'bodyweight_reps'},
  {name:'Overhead Press',group:'Shoulders',type:'weight_reps'},
  {name:'Lateral Raise',group:'Shoulders',type:'weight_reps'},
  {name:'Face Pull',group:'Shoulders',type:'weight_reps'},
  {name:'Barbell Curl',group:'Arms/Biceps',type:'weight_reps'},
  {name:'Dumbbell Curl',group:'Arms/Biceps',type:'weight_reps'},
  {name:'Hammer Curl',group:'Arms/Biceps',type:'weight_reps'},
  {name:'Tricep Pushdown',group:'Arms/Triceps',type:'weight_reps'},
  {name:'Skull Crusher',group:'Arms/Triceps',type:'weight_reps'},
  {name:'Close-Grip Bench',group:'Arms/Triceps',type:'weight_reps'},
  {name:'Plank',group:'Core',type:'time'},
  {name:'Cable Crunch',group:'Core',type:'weight_reps'},
  {name:'Ab Wheel',group:'Core',type:'bodyweight_reps'},
  {name:'Running',group:'Cardio',type:'time_distance'},
  {name:'Cycling',group:'Cardio',type:'time_distance'},
  {name:'Row Machine',group:'Cardio',type:'time_distance'}
];

var GROUP_OPTS = ['Chest','Back','Shoulders','Arms/Biceps','Arms/Triceps','Legs','Glutes','Core','Full Body','Cardio'];
var TYPE_OPTS = ['weight_reps','bodyweight_reps','time','distance','time_distance'];
var GOAL_OPTS = ['Hypertrophy','Strength','Power','Endurance','Maintenance','Cutting','Bulking','Athletic Performance','Mobility & Flexibility'];
var GOAL_COLORS = {Hypertrophy:D.pur, Strength:D.acc, Power:D.warn, Endurance:D.ok, Maintenance:D.mut, Cutting:D.err, Bulking:D.pur, 'Athletic Performance':D.acc, 'Mobility & Flexibility':D.ok};
var SCREENS = ['Dashboard','Log','Coach','Body','Goals','Profile'];

function typeLabel(t) {
  var map = {weight_reps:'Weight/Reps', bodyweight_reps:'Bodyweight/Reps', time:'Time', distance:'Distance', time_distance:'Time+Distance'};
  return map[t] || t;
}

function calcBF(pinches, sites, age, gender) {
  var total = 0;
  for(var i=0;i<sites.length;i++) total += parseFloat(pinches[sites[i]])||0;
  if(total===0) return null;
  var bd;
  if(gender==='female') {
    bd = 1.097 - (0.00046971*total) + (0.00000056*total*total) - (0.00012828*age);
  } else {
    bd = 1.10938 - (0.0008267*total) + (0.0000016*total*total) - (0.0002574*age);
  }
  return (4.95/bd - 4.50)*100;
}

function calcBMR(weightLb, heightCm, age, gender, leanLb) {
  if(leanLb) return Math.round(370 + 21.6*(leanLb*0.453592));
  var wkg = weightLb*0.453592;
  if(gender==='female') return Math.round((10*wkg)+(6.25*heightCm)-(5*age)-161);
  return Math.round((10*wkg)+(6.25*heightCm)-(5*age)+5);
}

function useAppState() {
  var _a = useState(function(){ return store.get('forge_library', DEFAULT_LIBRARY); });
  var library=_a[0], setLibrary=_a[1];
  var _b = useState(function(){ return store.get('forge_sessions', []); });
  var sessions=_b[0], setSessions=_b[1];
  var _c = useState(function(){ return store.get('forge_goals', {selected:['Strength','Hypertrophy'], primary:'Strength', weeks:'12', level:'Intermediate (2-5 yrs)', notes:''}); });
  var goals=_c[0], setGoals=_c[1];
  var _d = useState(function(){ return store.get('forge_body', []); });
  var bodyLog=_d[0], setBodyLog=_d[1];
  var _e = useState(function(){ return store.get('forge_analyses', []); });
  var formAnalyses=_e[0], setFormAnalyses=_e[1];
  var _f = useState(function(){ return store.get('forge_profile', {name:'', age:'', gender:'male', heightFt:'', heightIn:'', activity:'moderate'}); });
  var profile=_f[0], setProfile=_f[1];

  function saveLibrary(v) { setLibrary(v); store.set('forge_library', v); }
  function saveSessions(fn) {
    setSessions(function(prev) {
      var v = typeof fn==='function' ? fn(prev) : fn;
      store.set('forge_sessions', v);
      return v;
    });
  }
  function saveGoals(v) { setGoals(v); store.set('forge_goals', v); }
  function saveBodyLog(fn) {
    setBodyLog(function(prev) {
      var v = typeof fn==='function' ? fn(prev) : fn;
      store.set('forge_body', v);
      return v;
    });
  }
  function saveFormAnalyses(fn) {
    setFormAnalyses(function(prev) {
      var v = typeof fn==='function' ? fn(prev) : fn;
      store.set('forge_analyses', v);
      return v;
    });
  }
  function saveProfile(v) { setProfile(v); store.set('forge_profile', v); }

  return {library, saveLibrary, sessions, saveSessions, goals, saveGoals, bodyLog, saveBodyLog, formAnalyses, saveFormAnalyses, profile, saveProfile};
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard(props) {
  var sessions=props.sessions, goals=props.goals, bodyLog=props.bodyLog, setScreen=props.setScreen;
  var _x = useState(null); var expanded=_x[0], setExpanded=_x[1];
  var last5 = sessions.slice(-5).reverse();
  var liftTrends = {};
  sessions.forEach(function(s) {
    s.exercises.forEach(function(ex) {
      var best = ex.sets.reduce(function(b,st){ return Math.max(b, parseFloat(st.w)||0); }, 0);
      if(!liftTrends[ex.name]) liftTrends[ex.name]=[];
      liftTrends[ex.name].push(best);
    });
  });
  var trendItems = Object.keys(liftTrends).slice(0,6).map(function(name) {
    var vals = liftTrends[name];
    var latest=vals[vals.length-1], prev=vals[vals.length-2];
    var pct = (prev&&prev>0) ? ((latest-prev)/prev*100).toFixed(1) : null;
    var color = pct==null ? D.mut : parseFloat(pct)>0 ? D.ok : parseFloat(pct)<0 ? D.err : D.warn;
    var label = pct==null ? 'New' : (parseFloat(pct)>0 ? '+'+pct+'%' : pct+'%');
    return {name:name, val:latest+' lb', trend:label, color:color};
  });
  var latestBody = bodyLog.length ? bodyLog[bodyLog.length-1] : null;

  return e(Fragment, null,
    e('div', {style:{marginBottom:20}},
      e('div', {style:{fontSize:20, fontWeight:700, letterSpacing:2}}, 'DASHBOARD'),
      e('div', {style:{fontSize:12, color:D.mut, marginTop:2}}, new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}))),
    sessions.length===0 && e('div', {style:{...css.card, textAlign:'center', padding:32, borderColor:D.acc+'44'}},
      e('div', {style:{fontSize:15, color:D.mut, marginBottom:12}}, 'No sessions logged yet'),
      e('button', {style:btn('pri'), onClick:function(){ setScreen(1); }}, 'Log Your First Workout')),
    sessions.length>0 && e(Fragment, null,
      e('div', {style:{...css.g4, marginBottom:16}},
        e('div', {style:css.metric}, e('div', {style:metricVal(D.acc)}, sessions.length), e('div', {style:metricLbl()}, 'Sessions')),
        e('div', {style:css.metric}, e('div', {style:metricVal(D.ok)}, sessions.reduce(function(t,s){ return t+s.exercises.reduce(function(tt,ex){ return tt+ex.sets.length; },0); },0)), e('div', {style:metricLbl()}, 'Total Sets')),
        latestBody && e('div', {style:css.metric}, e('div', {style:metricVal(D.pur)}, latestBody.bf ? latestBody.bf.toFixed(1)+'%' : '--'), e('div', {style:metricLbl()}, 'Body Fat')),
        latestBody && e('div', {style:css.metric}, e('div', {style:metricVal(D.warn)}, latestBody.weight ? latestBody.weight+' lb' : '--'), e('div', {style:metricLbl()}, 'Weight'))),
      trendItems.length>0 && e('div', {style:css.card},
        e('div', {style:css.cardTitle}, 'Lift Trends'),
        trendItems.map(function(l) {
          return e('div', {key:l.name, style:{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid '+D.bdr}},
            e('div', {style:{fontSize:13, fontWeight:500}}, l.name),
            e('div', {style:{display:'flex', gap:8, alignItems:'center'}},
              e('span', {style:{fontSize:12, color:D.mut}}, l.val),
              e('span', {style:badge(l.color)}, l.trend)));
        })),
      e('div', {style:css.card},
        e('div', {style:{...css.row, justifyContent:'space-between', marginBottom:12}},
          e('div', {style:css.cardTitle}, 'Recent Sessions')),
        last5.map(function(s, i) {
          return e('div', {key:s.id||i},
            e('div', {style:{padding:'10px 0', borderBottom:'1px solid '+D.bdr, cursor:'pointer'}, onClick:function(){ setExpanded(expanded===i?null:i); }},
              e('div', {style:{...css.row, justifyContent:'space-between'}},
                e('div', null,
                  e('div', {style:{fontSize:13, fontWeight:500}}, new Date(s.date).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})+' - '+s.timeOfDay),
                  e('div', {style:{fontSize:11, color:D.mut, marginTop:2}}, s.exercises.map(function(ex){ return ex.name; }).join(', '))),
                e('div', {style:{display:'flex', gap:8, alignItems:'center'}},
                  e('span', {style:badge(D.acc)}, s.exercises.length+' ex'),
                  e('span', {style:{color:D.mut}}, expanded===i ? '▲' : '▼'))),
              expanded===i && e('div', {style:{marginTop:10, paddingTop:10, borderTop:'1px solid '+D.faint}},
                s.sessionNote && e('div', {style:{fontSize:12, color:D.mut, marginBottom:8, fontStyle:'italic'}}, 'Note: '+s.sessionNote),
                s.exercises.map(function(ex, ei) {
                  return e('div', {key:ei, style:{marginBottom:10}},
                    e('div', {style:{fontSize:13, fontWeight:600, color:D.acc, marginBottom:4}}, ex.name),
                    e('div', {style:{display:'flex', flexWrap:'wrap', gap:4}},
                      ex.sets.filter(function(st){ return st.w||st.r; }).map(function(st, si) {
                        var parts = [];
                        if(st.w) parts.push(st.w+'lb');
                        if(st.r) parts.push(st.r+' reps');
                        if(st.rest) parts.push(st.rest+'s rest');
                        return e('div', {key:si, style:{background:D.sur, borderRadius:6, padding:'3px 8px', fontSize:12}}, 'Set '+(si+1)+': '+parts.join(' / '));
                      })));
                }))));
        }))));
}

// ─── LOG ──────────────────────────────────────────────────────────────────────
function WorkoutLog(props) {
  var library=props.library, saveLibrary=props.saveLibrary, saveSessions=props.saveSessions, setScreen=props.setScreen, sessions=props.sessions;
  var cached = getBC()['active_workout'] || {};
  var _a=useState(cached.exercises||[]); var exercises=_a[0], setExercises=_a[1];
  var _b=useState(cached.sessNote||''); var sessNote=_b[0], setSessNote=_b[1];
  var _c=useState(false); var showAdd=_c[0], setShowAdd=_c[1];
  var _d=useState(false); var showNewEx=_d[0], setShowNewEx=_d[1];
  var _e2=useState(''); var selectedEx=_e2[0], setSelectedEx=_e2[1];
  var _f2=useState({name:'',group:'Chest',type:'weight_reps'}); var newEx=_f2[0], setNewEx=_f2[1];
  var _g=useState(false); var saved=_g[0], setSaved=_g[1];
  var timers=useRef({});
  var startTime=useRef(cached.startTime||Date.now());

  useEffect(function(){ setSC('active_workout', {exercises:exercises, sessNote:sessNote, startTime:startTime.current}); }, [exercises, sessNote]);

  var now=new Date(), hour=now.getHours();
  var timeOfDay = hour<10?'Early AM (Fasted)':hour<13?'Morning':hour<17?'Afternoon':'Evening';
  var fedState = (hour<10||hour<13)?'likely fasted':'likely fed';

  function getLastLog(exName) {
    for(var i=sessions.length-1;i>=0;i--) {
      var found = sessions[i].exercises.find(function(ex){ return ex.name===exName; });
      if(found && found.sets.length>0) {
        var sets = found.sets.filter(function(s){ return s.w||s.r; });
        if(sets.length>0) return sets;
      }
    }
    return null;
  }

  function addExerciseToLog() {
    var ex = showNewEx ? newEx : library.find(function(l){ return l.name===selectedEx; })||null;
    if(!ex||!ex.name) return;
    if(showNewEx && !library.find(function(l){ return l.name===ex.name; })) saveLibrary([...library, {name:ex.name, group:ex.group, type:ex.type}]);
    var lastLog = getLastLog(ex.name);
    var entry = {id:Date.now(), name:ex.name, group:ex.group, type:ex.type, lastLog:lastLog, sets:[{w:'',r:'',rest:'',note:'',time:Date.now()}]};
    setExercises(function(prev){ return [...prev, entry]; });
    timers.current[exercises.length+'_last'] = Date.now();
    setShowAdd(false); setShowNewEx(false); setSelectedEx(''); setNewEx({name:'',group:'Chest',type:'weight_reps'});
  }

  function addSet(i) {
    var t=Date.now(), last=timers.current[i+'_last'];
    var autoRest = last ? Math.max(0, Math.round((t-last)/1000)-12) : '';
    timers.current[i+'_last'] = t;
    setExercises(function(prev){ return prev.map(function(ex,idx){ return idx!==i?ex:{...ex, sets:[...ex.sets, {w:'',r:'',rest:autoRest,note:'',time:t}]}; }); });
  }
  function delSet(ei,si){ setExercises(function(prev){ return prev.map(function(ex,i){ return i!==ei?ex:{...ex, sets:ex.sets.filter(function(_,j){ return j!==si; })}; }); }); }
  function delExercise(i){ setExercises(function(prev){ return prev.filter(function(_,idx){ return idx!==i; }); }); }
  function upd(ei,si,f,v){ setExercises(function(prev){ return prev.map(function(ex,i){ return i!==ei?ex:{...ex, sets:ex.sets.map(function(s,j){ return j!==si?s:{...s, [f]:v}; })}; }); }); }

  function finishSession() {
    if(exercises.length===0){ alert('Add at least one exercise before finishing.'); return; }
    var session = {
      id:Date.now(), date:new Date().toISOString(), timeOfDay:timeOfDay, fedState:fedState,
      sessionNote:sessNote, duration:Math.round((Date.now()-startTime.current)/60000),
      exercises:exercises.map(function(ex){ return {...ex, sets:ex.sets.filter(function(s){ return s.w||s.r||s.rest; })}; })
    };
    saveSessions(function(prev){ return [...(Array.isArray(prev)?prev:[]), session]; });
    setSaved(true);
    setSC('active_workout', null);
    setTimeout(function(){ setExercises([]); setSessNote(''); setSaved(false); startTime.current=Date.now(); setScreen(0); }, 1200);
  }

  return e(Fragment, null,
    e('div', {style:{...css.row, justifyContent:'space-between', marginBottom:16}},
      e('div', null,
        e('div', {style:{fontSize:18, fontWeight:700, letterSpacing:2}}, 'LOG WORKOUT'),
        e('div', {style:{fontSize:11, color:D.acc, marginTop:2}}, now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})+' - '+timeOfDay+' - '+fedState)),
      e('button', {style:btn('pri'), onClick:function(){ setShowAdd(true); }}, '+ Add Exercise')),
    e('div', {style:css.card},
      e('label', {style:css.lbl}, 'Session Notes'),
      e('textarea', {style:{...css.ta, minHeight:44}, placeholder:'e.g. Fasted, slept 5h, shoulder tightness...', value:sessNote, onChange:function(ev){ setSessNote(ev.target.value); }})),
    exercises.map(function(ex, ei) {
      return e('div', {key:ex.id, style:css.card},
        e('div', {style:{...css.row, justifyContent:'space-between', marginBottom:6}},
          e('div', null,
            e('div', {style:{fontSize:15, fontWeight:600}}, ex.name),
            e('div', {style:{fontSize:11, color:D.mut, marginTop:1}}, ex.group+' - '+typeLabel(ex.type))),
          e('button', {style:{...btn('danger'), padding:'4px 10px', fontSize:11}, onClick:function(){ delExercise(ei); }}, 'Remove')),
        ex.lastLog && e('div', {style:{fontSize:11, color:D.mut, marginBottom:8, padding:'6px 10px', background:D.sur, borderRadius:6}},
          'Last session: '+ex.lastLog.map(function(s,i){ return 'Set '+(i+1)+': '+(s.w?s.w+'lb ':'')+( s.r?s.r+' reps':''); }).join(' / ')),
        e('div', {style:{display:'grid', gridTemplateColumns:'28px 1fr 1fr 70px 1fr 24px', gap:5, marginBottom:5}},
          ['#','Weight','Reps','Rest(s)','Notes',''].map(function(h,i){ return e('div',{key:i,style:{fontSize:10,color:D.mut,letterSpacing:1,textTransform:'uppercase'}},h); })),
        ex.sets.map(function(s,si) {
          return e('div', {key:si, style:{display:'grid', gridTemplateColumns:'28px 1fr 1fr 70px 1fr 24px', gap:5, marginBottom:5, alignItems:'center'}},
            e('div', {style:{fontSize:12, color:D.mut, textAlign:'center'}}, si+1),
            e('input', {style:css.inp, type:'number', placeholder:'lb', value:s.w, onChange:function(ev){ upd(ei,si,'w',ev.target.value); }}),
            e('input', {style:css.inp, type:'number', placeholder:'reps', value:s.r, onChange:function(ev){ upd(ei,si,'r',ev.target.value); }}),
            e('input', {style:{...css.inp, background:s.rest?D.accdim:D.sur}, type:'number', placeholder:'auto', value:s.rest, onChange:function(ev){ upd(ei,si,'rest',ev.target.value); }}),
            e('input', {style:{...css.inp, fontSize:11}, placeholder:'note...', value:s.note, onChange:function(ev){ upd(ei,si,'note',ev.target.value); }}),
            e('button', {style:{background:'transparent', border:'none', color:D.err, cursor:'pointer', fontSize:18, padding:0}, onClick:function(){ delSet(ei,si); }}, 'x'));
        }),
        e('button', {style:{...btn('ghost'), fontSize:12, padding:'5px 12px', marginTop:4}, onClick:function(){ addSet(ei); }}, '+ Set'));
    }),
    showAdd && e('div', {style:{...css.card, border:'1px solid '+D.acc+'55'}},
      e('div', {style:css.cardTitle}, 'Add Exercise'),
      !showNewEx && e(Fragment, null,
        e('label', {style:css.lbl}, 'Choose from library'),
        e('select', {style:{...css.sel, marginBottom:10}, value:selectedEx, onChange:function(ev){ setSelectedEx(ev.target.value); }},
          e('option', {value:''}, '-- Select exercise --'),
          GROUP_OPTS.map(function(g) {
            var exs = library.filter(function(l){ return l.group===g; });
            if(!exs.length) return null;
            return e(Fragment, {key:g},
              e('option', {disabled:true}, '-- '+g+' --'),
              exs.map(function(l){ return e('option', {key:l.name, value:l.name}, l.name); }));
          })),
        e('div', {style:{...css.row, flexWrap:'wrap', gap:8}},
          e('button', {style:btn('pri'), onClick:addExerciseToLog}, 'Add to Session'),
          e('button', {style:{...btn('ghost'), fontSize:12}, onClick:function(){ setShowNewEx(true); }}, '+ Create New'),
          e('button', {style:btn('ghost'), onClick:function(){ setShowAdd(false); }}, 'Cancel'))),
      showNewEx && e(Fragment, null,
        e('div', {style:css.g3},
          e('div', null, e('label',{style:css.lbl},'Name'), e('input',{style:css.inp, placeholder:'e.g. Hack Squat', value:newEx.name, onChange:function(ev){ setNewEx({...newEx, name:ev.target.value}); }})),
          e('div', null, e('label',{style:css.lbl},'Muscle Group'), e('select',{style:css.sel, value:newEx.group, onChange:function(ev){ setNewEx({...newEx, group:ev.target.value}); }}, GROUP_OPTS.map(function(g){ return e('option',{key:g},g); }))),
          e('div', null, e('label',{style:css.lbl},'Type'), e('select',{style:css.sel, value:newEx.type, onChange:function(ev){ setNewEx({...newEx, type:ev.target.value}); }}, TYPE_OPTS.map(function(t){ return e('option',{key:t,value:t},typeLabel(t)); })))),
        e('div', {style:{...css.row, marginTop:10, flexWrap:'wrap', gap:8}},
          e('button', {style:btn('pri'), onClick:addExerciseToLog}, 'Create & Add'),
          e('button', {style:{...btn('ghost'), fontSize:12}, onClick:function(){ setShowNewEx(false); }}, 'Back'),
          e('button', {style:btn('ghost'), onClick:function(){ setShowAdd(false); setShowNewEx(false); }}, 'Cancel')))),
    saved
      ? e('div', {style:{...btn('pri'), width:'100%', padding:14, fontSize:14, letterSpacing:2, marginTop:8, textAlign:'center', background:D.ok, borderRadius:7}}, 'SESSION SAVED')
      : e('button', {style:{...btn('pri'), width:'100%', padding:14, fontSize:14, letterSpacing:2, marginTop:8}, onClick:finishSession}, 'FINISH & SAVE SESSION'));
}

// ─── COACH ────────────────────────────────────────────────────────────────────
function Coach(props) {
  var sessions=props.sessions, goals=props.goals, bodyLog=props.bodyLog, profile=props.profile, formAnalyses=props.formAnalyses, saveFormAnalyses=props.saveFormAnalyses;
  var initMsgs = getBC()['coach_msgs'] || [{role:'assistant', text:'Hi! I am your FORGE AI Coach. I have access to all your logged sessions, body composition data, goals, and profile. Ask me anything about your training, recovery, programming, or nutrition.'}];
  var _a=useState(initMsgs); var msgs=_a[0], setMsgs=_a[1];
  var _b=useState(''); var inp=_b[0], setInp=_b[1];
  var _c=useState(false); var loading=_c[0], setLoading=_c[1];
  var _d=useState(false); var analyzing=_d[0], setAnalyzing=_d[1];
  var chatRef=useRef(null);

  useEffect(function(){ if(chatRef.current) chatRef.current.scrollTop=chatRef.current.scrollHeight; }, [msgs]);
  useEffect(function(){ setSC('coach_msgs', msgs); }, [msgs]);

  function buildContext() {
    var latestBody = bodyLog.length ? bodyLog[bodyLog.length-1] : null;
    var liftHistory = {};
    sessions.forEach(function(s) {
      s.exercises.forEach(function(ex) {
        if(!liftHistory[ex.name]) liftHistory[ex.name]=[];
        var best = ex.sets.reduce(function(b,st){ return Math.max(b, parseFloat(st.w)||0); }, 0);
        liftHistory[ex.name].push({date:s.date, weight:best, sets:ex.sets.length, timeOfDay:s.timeOfDay, fedState:s.fedState});
      });
    });
    var stalls = Object.keys(liftHistory).filter(function(name) {
      var v=liftHistory[name];
      if(v.length<3) return false;
      var last3=v.slice(-3).map(function(x){ return x.weight; });
      return last3.every(function(w){ return w===last3[0]&&w>0; });
    });
    var heightCm = profile.heightFt ? Math.round((parseInt(profile.heightFt||0)*12+parseInt(profile.heightIn||0))*2.54) : null;
    var recentStr = JSON.stringify(sessions.slice(-10).map(function(s){
      return {date:s.date, timeOfDay:s.timeOfDay, fedState:s.fedState, note:s.sessionNote,
        exercises:s.exercises.map(function(ex){ return {name:ex.name, group:ex.group, sets:ex.sets.map(function(st){ return {w:st.w,r:st.r,rest:st.rest,note:st.note}; })}; })};
    })).slice(0,3000);
    return 'You are FORGE, an elite AI fitness coach (CSCS-level). You have the users full training data.\n\n' +
      'PROFILE: ' + JSON.stringify({...profile, heightCm:heightCm}) + '\n' +
      'GOALS: ' + JSON.stringify(goals) + '\n' +
      'RECENT SESSIONS: ' + recentStr + '\n' +
      'STALLED LIFTS: ' + (stalls.join(', ')||'None') + '\n' +
      'BODY COMP: ' + (latestBody?JSON.stringify(latestBody):'Not logged') + '\n' +
      'TOTAL SESSIONS: ' + sessions.length + '\n\n' +
      'Be specific, science-backed, actionable. Reference actual data. Note fasted/fed patterns. Cite research when relevant. Be concise.';
  }

  function send() {
    if(!inp.trim()||loading) return;
    var txt=inp.trim(); setInp('');
    var newMsgs=[...msgs, {role:'user', text:txt}];
    setMsgs(newMsgs); setLoading(true);
    fetch(API_ENDPOINT, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:MODEL, max_tokens:1024, system:buildContext(), messages:newMsgs.map(function(m){ return {role:m.role, content:m.text}; })})
    }).then(function(res){ return res.json(); }).then(function(data) {
      if(data.error) setMsgs(function(m){ return [...m, {role:'assistant', text:'API Error: '+data.error.message}]; });
      else setMsgs(function(m){ return [...m, {role:'assistant', text:(data.content&&data.content[0]&&data.content[0].text)||'No response.'}]; });
      setLoading(false);
    }).catch(function(err){ setMsgs(function(m){ return [...m, {role:'assistant', text:'Network error: '+err.message}]; }); setLoading(false); });
  }

  function analyzeFile(file) {
    setAnalyzing(true);
    var reader=new FileReader();
    reader.onload=function() {
      var b64=reader.result.split(',')[1];
      var isImage=file.type.startsWith('image/');
      var content = isImage
        ? [{type:'image', source:{type:'base64', media_type:file.type, data:b64}}, {type:'text', text:'Analyze this exercise form image. Identify: 1) Exercise performed, 2) Form strengths, 3) Form issues/compensation patterns, 4) Corrective cues, 5) Long-term coaching notes.'}]
        : [{type:'text', text:'User uploaded video "'+file.name+'" for form analysis. Provide general form coaching cues for this exercise based on the filename, and ask them to describe what they noticed for more specific feedback.'}];
      fetch(API_ENDPOINT, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({model:MODEL, max_tokens:1024, messages:[{role:'user', content:content}]})
      }).then(function(res){ return res.json(); }).then(function(data) {
        var text=(data.content&&data.content[0]&&data.content[0].text)||'Could not analyze.';
        var analysis={date:new Date().toISOString(), filename:file.name, analysis:text};
        saveFormAnalyses(function(prev){ return [...prev, analysis]; });
        setMsgs(function(m){ return [...m, {role:'assistant', text:'Form analysis for "'+file.name+'":\n\n'+text}]; });
        setAnalyzing(false);
      }).catch(function(err){ setMsgs(function(m){ return [...m, {role:'assistant', text:'Analysis error: '+err.message}]; }); setAnalyzing(false); });
    };
    reader.readAsDataURL(file);
  }

  return e(Fragment, null,
    e('div', {style:{fontSize:18, fontWeight:700, letterSpacing:2, marginBottom:4}}, 'AI COACH'),
    e('div', {style:{fontSize:11, color:D.mut, marginBottom:16}}, 'Powered by your logged data - Science-backed'),
    e('div', {style:{...css.card, padding:'10px 16px', marginBottom:12}},
      e('div', {style:{fontSize:11, color:D.mut, marginBottom:6, letterSpacing:1, textTransform:'uppercase'}}, 'Context'),
      e('div', {style:{display:'flex', gap:8, flexWrap:'wrap'}},
        e('span', {style:badge(D.acc)}, sessions.length+' sessions'),
        e('span', {style:badge(D.ok)}, goals.primary||'No goal'),
        profile.name && e('span', {style:badge(D.mut)}, profile.name),
        bodyLog.length ? e('span', {style:badge(D.pur)}, 'Body comp logged') : null,
        formAnalyses.length ? e('span', {style:badge(D.warn)}, formAnalyses.length+' analyses') : null)),
    e('div', {ref:chatRef, style:{...css.card, minHeight:300, maxHeight:440, overflowY:'auto', marginBottom:12}},
      msgs.map(function(m, i) {
        return e('div', {key:i, style:{marginBottom:14, display:'flex', flexDirection:m.role==='user'?'row-reverse':'row', gap:8}},
          e('div', {style:{width:28, height:28, borderRadius:6, background:m.role==='user'?D.faint:D.accdim, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, flexShrink:0, color:m.role==='user'?D.mut:D.acc, fontWeight:700}}, m.role==='user'?'YOU':'AI'),
          e('div', {style:{background:m.role==='user'?D.sur:D.accdim, border:'1px solid '+(m.role==='user'?D.bdr:D.acc+'44'), borderRadius:10, padding:'10px 14px', fontSize:13, lineHeight:1.7, maxWidth:'85%', whiteSpace:'pre-wrap'}}, m.text));
      }),
      loading && e('div', {style:{color:D.mut, fontSize:13, padding:'8px 14px', fontStyle:'italic'}}, 'Analyzing...')),
    e('div', {style:{...css.card, marginBottom:12}},
      e('div', {style:{fontSize:11, color:D.mut, marginBottom:6, letterSpacing:1, textTransform:'uppercase'}}, 'Form Analysis'),
      e('div', {style:{fontSize:11, color:D.mut, marginBottom:8}}, 'Upload a form photo or video. Analysis stored as text only - file is not saved.'),
      e('input', {type:'file', accept:'video/*,image/*', style:{...css.inp, padding:'6px'}, onChange:function(ev){ if(ev.target.files[0]) analyzeFile(ev.target.files[0]); }, disabled:analyzing}),
      analyzing && e('div', {style:{fontSize:12, color:D.acc, marginTop:6}}, 'Analyzing form...'),
      formAnalyses.length>0 && e(Fragment, null,
        e('div', {style:css.divider}),
        e('div', {style:{fontSize:11, color:D.mut, marginBottom:6, letterSpacing:1, textTransform:'uppercase'}}, 'Past Analyses ('+formAnalyses.length+')'),
        formAnalyses.slice().reverse().slice(0,3).map(function(a, i) {
          return e('div', {key:i, style:{borderTop:'1px solid '+D.bdr, paddingTop:8, marginTop:8}},
            e('div', {style:{...css.row, justifyContent:'space-between', marginBottom:4}},
              e('span', {style:badge(D.pur)}, a.filename),
              e('span', {style:{fontSize:11, color:D.mut}}, new Date(a.date).toLocaleDateString())),
            e('div', {style:{fontSize:12, color:D.txt, lineHeight:1.5}}, a.analysis.slice(0,250)+'...'));
        }))),
    e('div', {style:{...css.row, gap:8}},
      e('input', {style:{...css.inp, flex:1}, placeholder:'Ask your coach...', value:inp, onChange:function(ev){ setInp(ev.target.value); }, onKeyDown:function(ev){ if(ev.key==='Enter'&&!ev.shiftKey) send(); }}),
      e('button', {style:{...btn('pri'), flexShrink:0}, onClick:send, disabled:loading}, '→')));
}

// ─── BODY ────────────────────────────────────────────────────────────────────
function Body(props) {
  var bodyLog=props.bodyLog, saveBodyLog=props.saveBodyLog, profile=props.profile;
  var cached=getBC()['body_form']||{};
  var _a=useState(cached.pts||7); var pts=_a[0], setPts=_a[1];
  var _b=useState(cached.pinches||{}); var pinches=_b[0], setPinches=_b[1];
  var _c=useState(cached.meas||{weight:'',chest:'',waist:'',hips:'',neck:'',leftArm:'',rightArm:'',leftThigh:'',rightThigh:'',calf:''}); var meas=_c[0], setMeas=_c[1];
  var _d=useState(false); var saved=_d[0], setSaved=_d[1];

  useEffect(function(){ setSC('body_form', {pts:pts, pinches:pinches, meas:meas}); }, [pts, pinches, meas]);

  var siteMap = {
    7:['Chest','Abdomen','Suprailiac','Tricep','Subscapular','Midaxillary','Thigh'],
    5:['Chest','Abdomen','Suprailiac','Tricep','Thigh'],
    3:['Chest','Abdomen','Thigh']
  };
  var sites = siteMap[pts];
  var age = parseInt(profile.age)||35;
  var gender = profile.gender||'male';
  var bf = calcBF(pinches, sites, age, gender);
  var weight = parseFloat(meas.weight)||0;
  var lean = (bf!=null && weight>0) ? weight*(1-bf/100) : null;
  var heightCm = profile.heightFt ? Math.round((parseInt(profile.heightFt||0)*12+parseInt(profile.heightIn||0))*2.54) : null;
  var bmr = ((lean||weight) && heightCm && age) ? calcBMR(weight, heightCm, age, gender, lean) : null;

  function saveEntry() {
    var entry = {date:new Date().toISOString(), pts:pts, pinches:{...pinches}, measurements:{...meas}, bf:bf, lean:lean, bmr:bmr, weight:parseFloat(meas.weight)||null};
    saveBodyLog(function(prev){ return [...(Array.isArray(prev)?prev:[]), entry]; });
    setSaved(true); setTimeout(function(){ setSaved(false); }, 2000);
  }

  return e(Fragment, null,
    e('div', {style:{fontSize:18, fontWeight:700, letterSpacing:2, marginBottom:8}}, 'BODY COMPOSITION'),
    (!profile.age||!profile.heightFt) && e('div', {style:{...css.bubble, borderColor:D.warn+'66', background:D.warn+'11', marginBottom:16}},
      'Set your age, height, and gender in Profile for accurate BMR and body fat calculations.'),
    e('div', {style:css.g2},
      e('div', {style:css.card},
        e('div', {style:css.cardTitle}, 'Caliper Pinches - Jackson-Pollock'),
        e('div', {style:{...css.row, marginBottom:12, gap:6}},
          [3,5,7].map(function(n){ return e('button',{key:n, style:{...btn(pts===n?'pri':'ghost'), padding:'5px 14px', fontSize:12}, onClick:function(){ setPts(n); }}, n+'-Site'); })),
        sites.map(function(s) {
          return e('div', {key:s, style:{...css.row, marginBottom:8}},
            e('label', {style:{...css.lbl, margin:0, width:100, flexShrink:0}}, s),
            e('input', {style:{...css.inp, width:80}, type:'number', placeholder:'mm', value:pinches[s]||'', onChange:function(ev){ setPinches({...pinches, [s]:ev.target.value}); }}),
            e('span', {style:{fontSize:11, color:D.mut}}, 'mm'));
        }),
        bf!=null && e('div', {style:{marginTop:10, borderTop:'1px solid '+D.bdr, paddingTop:10}},
          e('div', {style:{...css.row, justifyContent:'space-between', marginBottom:4}}, e('span',{style:{fontSize:12,color:D.mut}}, 'Est. Body Fat ('+gender+', age '+age+')'), e('span',{style:{fontSize:16,fontWeight:700,color:D.acc}}, bf.toFixed(1)+'%')),
          lean && e('div', {style:{...css.row, justifyContent:'space-between', marginBottom:4}}, e('span',{style:{fontSize:12,color:D.mut}},'Lean Mass'), e('span',{style:{fontSize:14,fontWeight:600,color:D.ok}}, lean.toFixed(1)+' lb')),
          bmr && e('div', {style:{...css.row, justifyContent:'space-between'}}, e('span',{style:{fontSize:12,color:D.mut}}, lean?'BMR (Katch-McArdle)':'BMR (Mifflin-St Jeor)'), e('span',{style:{fontSize:14,fontWeight:600,color:D.warn}}, bmr+' kcal/day')))),
      e('div', {style:css.card},
        e('div', {style:css.cardTitle}, 'Tape Measurements'),
        Object.keys(meas).map(function(k) {
          var label = k.replace(/([A-Z])/g,' $1').replace(/^./,function(s){ return s.toUpperCase(); });
          return e('div', {key:k, style:{...css.row, marginBottom:8}},
            e('label', {style:{...css.lbl, margin:0, width:100, flexShrink:0, textTransform:'none', fontSize:12}}, label),
            e('input', {style:{...css.inp, width:80}, type:'number', step:'0.1', placeholder:'--', value:meas[k], onChange:function(ev){ setMeas({...meas, [k]:ev.target.value}); }}),
            e('span', {style:{fontSize:11, color:D.mut}}, k==='weight'?'lb':'in'));
        }))),
    bmr && e('div', {style:{...css.bubble, marginBottom:12}},
      e('strong', {style:{color:D.acc}}, 'Coach Nutrition Insight'),
      ' - Lean mass: '+(lean?lean.toFixed(0)+' lb - ':'')+'BMR: '+bmr+' kcal - Moderate activity target: ~'+Math.round(bmr*1.55)+' kcal/day - Protein: '+(lean?Math.round(lean):Math.round(weight*0.8))+' g/day'),
    e('button', {style:{...btn(saved?'ghost':'pri'), width:'100%', padding:12, fontSize:14, letterSpacing:2, marginBottom:16}, onClick:saveEntry}, saved?'Saved':'SAVE ENTRY'),
    bodyLog.length>0 && e('div', {style:css.card},
      e('div', {style:css.cardTitle}, 'History'),
      bodyLog.slice().reverse().slice(0,6).map(function(h, i) {
        return e('div', {key:i, style:{padding:'7px 0', borderBottom:'1px solid '+D.bdr, display:'flex', justifyContent:'space-between', alignItems:'center'}},
          e('div', {style:{fontSize:12, color:D.mut}}, new Date(h.date).toLocaleDateString()),
          e('div', {style:{display:'flex', gap:10}},
            h.weight && e('span', {style:{fontSize:12}}, h.weight+' lb'),
            h.bf!=null && e('span', {style:{fontSize:12, color:D.acc}}, h.bf.toFixed(1)+'% BF'),
            h.lean && e('span', {style:{fontSize:12, color:D.ok}}, h.lean.toFixed(0)+' lb lean')));
      })));
}

// ─── GOALS ───────────────────────────────────────────────────────────────────
function Goals(props) {
  var goals=props.goals, saveGoals=props.saveGoals;
  var _a=useState({...goals}); var local=_a[0], setLocal=_a[1];
  var _b=useState(false); var saved=_b[0], setSaved=_b[1];
  useEffect(function(){ setSC('goals_form', local); }, [local]);

  function save(){ saveGoals(local); setSaved(true); setTimeout(function(){ setSaved(false); }, 2000); }
  function toggle(g){ setLocal(function(l){ return {...l, selected:l.selected.includes(g)?l.selected.filter(function(x){ return x!==g; }):[...l.selected,g]}; }); }

  return e(Fragment, null,
    e('div', {style:{fontSize:18, fontWeight:700, letterSpacing:2, marginBottom:4}}, 'TRAINING GOALS'),
    e('div', {style:{fontSize:12, color:D.mut, marginBottom:16}}, 'These are injected into every AI Coach response.'),
    e('div', {style:css.card},
      e('div', {style:css.cardTitle}, 'Select Goals'),
      e('div', {style:{display:'flex', flexWrap:'wrap', gap:8, marginBottom:16}},
        GOAL_OPTS.map(function(g) {
          var active=local.selected.includes(g);
          var c=GOAL_COLORS[g]||D.acc;
          return e('button', {key:g, onClick:function(){ toggle(g); }, style:{background:active?c+'22':D.sur, color:active?c:D.mut, border:'1px solid '+(active?c+'66':D.bdr), borderRadius:8, padding:'8px 14px', fontSize:13, cursor:'pointer'}}, g+(active?' v':''));
        })),
      local.selected.length>1 && e('div', {style:{marginBottom:12}},
        e('label', {style:css.lbl}, 'Primary Priority'),
        e('select', {style:css.sel, value:local.primary, onChange:function(ev){ setLocal({...local, primary:ev.target.value}); }},
          local.selected.map(function(g){ return e('option',{key:g},g); }))),
      e('div', {style:{...css.g2, marginBottom:12}},
        e('div', null, e('label',{style:css.lbl},'Timeframe (weeks)'), e('input',{style:css.inp, type:'number', value:local.weeks, onChange:function(ev){ setLocal({...local, weeks:ev.target.value}); }})),
        e('div', null, e('label',{style:css.lbl},'Experience Level'), e('select',{style:css.sel, value:local.level, onChange:function(ev){ setLocal({...local, level:ev.target.value}); }},
          ['Beginner (<2 yrs)','Intermediate (2-5 yrs)','Advanced (5+ yrs)'].map(function(l){ return e('option',{key:l},l); })))),
      e('div', {style:{marginBottom:12}},
        e('label', {style:css.lbl}, 'Context for your coach'),
        e('textarea', {style:{...css.ta, minHeight:60}, placeholder:'e.g. Powerlifting meet in 12 weeks, nagging left shoulder...', value:local.notes, onChange:function(ev){ setLocal({...local, notes:ev.target.value}); }})),
      e('button', {style:{...btn(saved?'ghost':'pri'), padding:'10px 24px'}, onClick:save}, saved?'Saved':'Save Goals')),
    local.selected.length>0 && e('div', {style:css.bubble},
      e('strong', {style:{color:D.acc}}, 'Active Coach Profile'),
      ' - Primary: '+local.primary+' - Secondary: '+(local.selected.filter(function(s){ return s!==local.primary; }).join(', ')||'none')+' - '+local.weeks+' weeks - '+local.level+(local.notes?'\n\nContext: '+local.notes:'')));
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────
function Profile(props) {
  var profile=props.profile, saveProfile=props.saveProfile;
  var _a=useState({...profile}); var local=_a[0], setLocal=_a[1];
  var _b=useState(false); var saved=_b[0], setSaved=_b[1];
  useEffect(function(){ setSC('profile_form', local); }, [local]);

  function save(){ saveProfile(local); setSaved(true); setTimeout(function(){ setSaved(false); }, 2000); }

  var heightCm = local.heightFt ? Math.round((parseInt(local.heightFt||0)*12+parseInt(local.heightIn||0))*2.54) : null;

  return e(Fragment, null,
    e('div', {style:{fontSize:18, fontWeight:700, letterSpacing:2, marginBottom:4}}, 'PROFILE'),
    e('div', {style:{fontSize:12, color:D.mut, marginBottom:16}}, 'Used for accurate BMR, body fat, and personalized coaching.'),
    e('div', {style:css.card},
      e('div', {style:css.cardTitle}, 'Personal Info'),
      e('div', {style:{...css.g2, marginBottom:12}},
        e('div', null, e('label',{style:css.lbl},'Name'), e('input',{style:css.inp, placeholder:'Your name', value:local.name||'', onChange:function(ev){ setLocal({...local, name:ev.target.value}); }})),
        e('div', null, e('label',{style:css.lbl},'Age'), e('input',{style:css.inp, type:'number', placeholder:'e.g. 30', value:local.age||'', onChange:function(ev){ setLocal({...local, age:ev.target.value}); }}))),
      e('div', {style:{marginBottom:12}},
        e('label', {style:css.lbl}, 'Biological Sex'),
        e('div', {style:{...css.row, gap:8}},
          ['male','female'].map(function(g){ return e('button',{key:g, style:{...btn(local.gender===g?'pri':'ghost'), padding:'7px 20px', fontSize:13}, onClick:function(){ setLocal({...local, gender:g}); }}, g.charAt(0).toUpperCase()+g.slice(1)); }))),
      e('div', {style:{marginBottom:12}},
        e('label', {style:css.lbl}, 'Height'),
        e('div', {style:{...css.row, gap:8}},
          e('input', {style:{...css.inp, width:70}, type:'number', placeholder:'ft', value:local.heightFt||'', onChange:function(ev){ setLocal({...local, heightFt:ev.target.value}); }}),
          e('span', {style:{fontSize:13, color:D.mut}}, 'ft'),
          e('input', {style:{...css.inp, width:70}, type:'number', placeholder:'in', value:local.heightIn||'', onChange:function(ev){ setLocal({...local, heightIn:ev.target.value}); }}),
          e('span', {style:{fontSize:13, color:D.mut}}, 'in'),
          heightCm && e('span', {style:{fontSize:12, color:D.mut}}, '= '+heightCm+' cm'))),
      e('div', {style:{marginBottom:16}},
        e('label', {style:css.lbl}, 'Activity Level'),
        e('select', {style:css.sel, value:local.activity||'moderate', onChange:function(ev){ setLocal({...local, activity:ev.target.value}); }},
          [['sedentary','Sedentary (desk job)'],['light','Lightly active (1-3 days/wk)'],['moderate','Moderately active (3-5 days/wk)'],['active','Very active (6-7 days/wk)'],['athlete','Athlete (2x/day)']].map(function(opt){ return e('option',{key:opt[0], value:opt[0]}, opt[1]); }))),
      e('button', {style:{...btn(saved?'ghost':'pri'), padding:'10px 24px'}, onClick:save}, saved?'Profile Saved':'Save Profile')),
    local.name && e('div', {style:css.bubble},
      e('strong', {style:{color:D.acc}}, local.name),
      (local.age?' - Age '+local.age:'')+' - '+(local.gender||'')+
      (heightCm?' - '+local.heightFt+"'"+local.heightIn+'" ('+heightCm+' cm)':'')+
      (local.activity?' - '+local.activity:'')));
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
var VIEWS = [Dashboard, WorkoutLog, Coach, Body, Goals, Profile];

function App() {
  var _a=useState(0); var screen=_a[0], setScreen=_a[1];
  var state=useAppState();
  var props = [
    {sessions:state.sessions, goals:state.goals, bodyLog:state.bodyLog, setScreen:setScreen},
    {library:state.library, saveLibrary:state.saveLibrary, saveSessions:state.saveSessions, setScreen:setScreen, sessions:state.sessions},
    {sessions:state.sessions, goals:state.goals, bodyLog:state.bodyLog, profile:state.profile, formAnalyses:state.formAnalyses, saveFormAnalyses:state.saveFormAnalyses},
    {bodyLog:state.bodyLog, saveBodyLog:state.saveBodyLog, profile:state.profile},
    {goals:state.goals, saveGoals:state.saveGoals},
    {profile:state.profile, saveProfile:state.saveProfile}
  ];
  return e('div', {style:css.app},
    e('nav', {style:css.nav},
      e('div', null, e('span',{style:css.logo},'FORGE'), e('span',{style:css.logoSub},'INTELLIGENT TRAINING')),
      e('div', {style:{display:'flex', gap:2, flexWrap:'wrap'}},
        SCREENS.map(function(s,i){ return e('button',{key:s, style:tab(screen===i), onClick:function(){ setScreen(i); }}, s.toUpperCase()); }))),
    e('div', {style:css.body}, e(VIEWS[screen], props[screen])));
}

createRoot(document.getElementById('root')).render(e(App, null));
export default App;
