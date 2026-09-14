import { useEffect,useMemo,useState } from "react";
import { Card,PageHeader,LoadingSkeleton,EmptyState } from "../components";
import { api } from "../api/client";
import type { DailyLog } from "../types/api";

export default function Progress(){
 const [logs,setLogs]=useState<DailyLog[]>([]);
 const [loading,setLoading]=useState(true);

 useEffect(()=>{api.getLogs("30d").then(r=>setLogs(r.logs??[])).catch(console.error).finally(()=>setLoading(false))},[]);

 const workouts=useMemo(()=>logs.filter(x=>x.workoutText?.trim()).length,[logs]);
 const meals=useMemo(()=>logs.filter(x=>x.mealsText?.trim()).length,[logs]);

 if(loading)return <><PageHeader title="Progress" subtitle="Track your fitness journey"/><Card><LoadingSkeleton lines={8}/></Card></>;

 return <>
  <PageHeader title="Progress" subtitle="Track your fitness journey"/>

  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"var(--space-4)"}}>
   <Card title="Check-ins"><h2>{logs.length}</h2><p>last 30 days</p></Card>
   <Card title="Workouts"><h2>{workouts}</h2><p>completed</p></Card>
   <Card title="Nutrition"><h2>{meals}</h2><p>days logged</p></Card>
  </div>

  <Card title="Activity History">
   {logs.length===0?<EmptyState title="No progress yet" message="Start logging your daily activity."/>:
   <div style={{display:"grid",gap:"12px"}}>
    {logs.map(log=><div key={log.date} style={{padding:"16px",border:"1px solid var(--color-border)",borderRadius:"var(--r-md)"}}>
     <strong>{log.date}</strong>
     <p style={{color:"var(--color-text-muted)"}}>
      {log.workoutText ? "Workout logged" : "No workout logged"} ·{" "}{log.mealsText ? "Meals logged" : "No meals logged"}
     </p>
    </div>)}
   </div>}
  </Card>
 </>;
}
