import { useEffect, useState } from "react";
import { Card, PageHeader, LoadingSkeleton, EmptyState } from "../components";
import { api } from "../api/client";
import type { DailyLog } from "../types/api";

export default function DailyLogs() {
  const [logs,setLogs]=useState<DailyLog[]>([]);
  const [date,setDate]=useState(new Date().toISOString().slice(0,10));
  const [workout,setWorkout]=useState("");
  const [meals,setMeals]=useState("");
  const [saving,setSaving]=useState(false);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");

  async function load(){ try { const r=await api.getLogs("30d"); setLogs(r.logs??[]); } finally {setLoading(false);} }
  useEffect(()=>{void load()},[]);

  async function save(){
    try{
      setSaving(true); setMessage("");
      await api.logDaily({date,workoutText:workout,mealsText:meals});
      setMessage("Check-in saved successfully.");
      await load();
      setWorkout(""); setMeals("");
    }catch(e){setMessage(e instanceof Error ? e.message : "Could not save check-in.");}
    finally{setSaving(false);}
  }

  if(loading) return <><PageHeader title="Daily Check-in" subtitle="Track your daily fitness activity"/><Card><LoadingSkeleton lines={8}/></Card></>;

  return <>
    <PageHeader title="Daily Check-in" subtitle="Track your daily fitness activity"/>

    <Card title="Today's Activity">
      <label>Date</label>
      <input type="date" value={date} onChange={e=>setDate(e.target.value)}
        style={{display:"block",width:"100%",padding:"12px",margin:"8px 0 20px"}}/>

      <label>Workout</label>
      <textarea value={workout} onChange={e=>setWorkout(e.target.value)}
        placeholder="What workout did you complete today?"
        rows={4} style={{display:"block",width:"100%",padding:"12px",margin:"8px 0 20px"}}/>

      <label>Meals</label>
      <textarea value={meals} onChange={e=>setMeals(e.target.value)}
        placeholder="What did you eat today?"
        rows={4} style={{display:"block",width:"100%",padding:"12px",margin:"8px 0 20px"}}/>

      {message && <p>{message}</p>}

      <button onClick={save} disabled={saving}
        style={{padding:"12px 20px",background:"var(--c-primary)",color:"#fff",border:0,borderRadius:"var(--r-md)"}}>
        {saving ? "Saving..." : "Save Check-in"}
      </button>
    </Card>

    <Card title="Recent Check-ins">
      {logs.length===0 ? <EmptyState title="No check-ins yet" message="Your activity will appear here."/> :
      <div style={{display:"grid",gap:"12px"}}>
        {logs.map(log=><div key={log.date} style={{padding:"16px",border:"1px solid var(--color-border)",borderRadius:"var(--r-md)"}}>
          <strong>{log.date}</strong>
          <p>{log.workoutText || "No workout logged"}</p>
          <p>{log.mealsText || "No meals logged"}</p>
        </div>)}
      </div>}
    </Card>
  </>;
}
