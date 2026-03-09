import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════
const DB = {
  get: async (k, shared=true) => { try { const r = await window.storage.get(k,shared); return r?JSON.parse(r.value):null; } catch { return null; } },
  set: async (k,v,shared=true) => { try { await window.storage.set(k,JSON.stringify(v),shared); } catch {} },
  del: async (k,shared=true) => { try { await window.storage.delete(k,shared); } catch {} },
};

// ═══════════════════════════════════════════════════════
// DEFAULT DATA
// ═══════════════════════════════════════════════════════
const DEF_BRANCHES = [{id:"b1",name:"Chi nhánh 1"}];
const DEF_ACCOUNTS = [
  {id:"a0",username:"admin",password:"admin123",name:"Chủ xe 👑",role:"admin",branchId:"b1",active:true},
  {id:"a1",username:"nhanvien",password:"nv123",name:"Nhân viên 1",role:"staff",branchId:"b1",active:true},
];
const DEF_INGREDIENTS = [
  {id:"i1",name:"Chả cá",unit:"kg"},
  {id:"i2",name:"Bánh mì",unit:"ổ"},
  {id:"i3",name:"Dưa cải / đồ chua",unit:"kg"},
  {id:"i4",name:"Tương ớt",unit:"chai"},
  {id:"i5",name:"Nước tương",unit:"chai"},
  {id:"i6",name:"Dầu ăn",unit:"chai"},
  {id:"i7",name:"Rau / rau thơm",unit:"nghìn đ"},
  {id:"i8",name:"Trứng",unit:"quả"},
  {id:"i9",name:"Túi kraft",unit:"cái"},
  {id:"i10",name:"Túi ni lông",unit:"cái"},
];
const DEF_PRODUCTS = [
  {id:"p1",name:"Chả cá thường",price:15000},
  {id:"p2",name:"Chả cá đặc biệt",price:15000},
  {id:"p3",name:"Chả cá + ốp la",price:15000},
  {id:"p4",name:"Bánh mì ốp la",price:15000},
];
const DEF_VANHANH = [
  {id:"v1",label:"Mặt bằng / thuê chỗ"},
  {id:"v2",label:"Điện / gas / than"},
  {id:"v3",label:"Xăng / đi chợ"},
  {id:"v4",label:"Tiền công nhân viên"},
  {id:"v5",label:"Chi phí khác"},
];

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════
const fmt = n => Number(n||0).toLocaleString("vi-VN")+"đ";
const toNum = v => Number(String(v??"").replace(/,/g, "")) || 0;
const fmtComma = v => {
  const digits = String(v??"").replace(/\D/g, "");
  if(!digits) return "";
  return Number(digits).toLocaleString("en-US");
};
const today = () => new Date().toISOString().slice(0,10);
const fmtD = s => { if(!s)return""; const[y,m,d]=s.split("-"); return`${d}/${m}/${y}`; };
const uid = () => "x"+Math.random().toString(36).slice(2,8);
const csvCell = v => {
  const raw = String(v ?? "");
  return /[",\n]/.test(raw) ? `"${raw.replace(/"/g,'""')}"` : raw;
};
const downloadCsv = (filename, rows) => {
  const csv = "\uFEFF" + rows.map(r=>r.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const C = {
  bg: "#ffffff", card: "#ffffff", accent: "#ec4899", accent2: "#db2777",
  gold: "#ec4899", text: "#111111", muted: "#6b7280",
  green: "#22c55e", red: "#ef4444", blue: "#3b82f6",
  border: "rgba(0,0,0,0.12)", borderStrong: "rgba(0,0,0,0.2)",
};

const inp = (extra={}) => ({
  background:"#ffffff", border:`1.5px solid ${C.border}`,
  borderRadius:8, padding:"8px 12px", color:C.text, fontFamily:"inherit",
  fontSize:14, outline:"none", width:"100%", boxSizing:"border-box", ...extra,
});

const btn = (bg, extra={}) => ({
  background:bg, border:"none", borderRadius:8, padding:"10px 16px",
  color:"#111111", fontWeight:700, fontSize:13, cursor:"pointer",
  fontFamily:"inherit", ...extra,
});

// ═══════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════
function LoginScreen({onLogin,onForgotPassword}) {
  const [u,setU]=useState(""); const [p,setP]=useState(""); const [err,setErr]=useState("");
  const [showForgot,setShowForgot]=useState(false);
  const [fName,setFName]=useState("");
  const [fPw,setFPw]=useState("");
  const [fMsg,setFMsg]=useState("");

  const handle = () => { if(!onLogin(u,p)) setErr("Sai tài khoản hoặc mật khẩu!"); };
  const handleForgot = async () => {
    const res = await onForgotPassword(u,fName,fPw);
    if(!res?.ok){
      setFMsg(res?.msg||"Không thể đặt lại mật khẩu");
      return;
    }
    setFMsg("✅ Đặt lại mật khẩu thành công, hãy đăng nhập lại");
    setP("");
    setFPw("");
    setShowForgot(false);
  };
  return (
    <div style={{minHeight:"100vh",background:"#ffffff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Nunito',sans-serif"}}>
      <div style={{width:340,background:"#ffffff",borderRadius:20,padding:36,border:`1px solid ${C.borderStrong}`,boxShadow:"0 10px 30px rgba(0,0,0,0.08)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:48,color:C.gold}}>🥖</div>
          <h1 style={{margin:"8px 0 4px",color:C.gold,fontSize:22,fontWeight:900}}>Xe Bánh Mì Chả Cá</h1>
          <p style={{margin:0,color:C.muted,fontSize:13}}>Hệ thống quản lý thu chi</p>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:12,color:C.muted,fontWeight:700,display:"block",marginBottom:5}}>TÀI KHOẢN</label>
          <input value={u} onChange={e=>setU(e.target.value)} placeholder="username" style={inp()} onKeyDown={e=>e.key==="Enter"&&handle()} />
        </div>
        <div style={{marginBottom:20}}>
          <label style={{fontSize:12,color:C.muted,fontWeight:700,display:"block",marginBottom:5}}>MẬT KHẨU</label>
          <input type="password" value={p} onChange={e=>setP(e.target.value)} placeholder="••••••••" style={inp()} onKeyDown={e=>e.key==="Enter"&&handle()} />
        </div>
        {err && <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.35)",borderRadius:8,padding:"8px 12px",color:"#b91c1c",fontSize:13,marginBottom:14}}>{err}</div>}
        <button onClick={handle} style={{...btn(`linear-gradient(90deg,${C.accent2},${C.accent})`),width:"100%",padding:14,fontSize:15,borderRadius:10}}>Đăng nhập</button>

        <div style={{marginTop:10,textAlign:"center"}}>
          <button onClick={()=>{setShowForgot(v=>!v);setFMsg("");}} style={{background:"transparent",border:"none",color:C.gold,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",textDecoration:"underline"}}>
            {showForgot?"Đóng quên mật khẩu":"Quên mật khẩu?"}
          </button>
        </div>

        {showForgot && (
          <div style={{marginTop:10,padding:12,background:"#ffffff",borderRadius:10,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:12,color:C.gold,fontWeight:800,marginBottom:8}}>Khôi phục mật khẩu</div>
            <div style={{display:"grid",gap:7}}>
              <input value={u} onChange={e=>setU(e.target.value)} placeholder="Username" style={inp({padding:"7px 10px",fontSize:13})} />
              <input value={fName} onChange={e=>setFName(e.target.value)} placeholder="Họ tên tài khoản" style={inp({padding:"7px 10px",fontSize:13})} />
              <input type="password" value={fPw} onChange={e=>setFPw(e.target.value)} placeholder="Mật khẩu mới (>=4 ký tự)" style={inp({padding:"7px 10px",fontSize:13})} />
              <button onClick={handleForgot} style={{...btn("#166534",{padding:"8px 12px",fontSize:13})}}>Đặt lại mật khẩu</button>
            </div>
            {fMsg && <div style={{marginTop:8,fontSize:12,color:fMsg.startsWith("✅")?"#86efac":"#fca5a5"}}>{fMsg}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════
function MainApp({user,accounts,branches,ingredients,products,
  saveAccounts,saveBranches,saveIngredients,saveProducts,
  getDayData,saveDayData,onLogout,dayKeys,
  exportBackup,importBackup}) {

  const isAdmin = user.role==="admin";
  const [tab,setTab]=useState("daily");
  const [selBranch,setSelBranch]=useState(isAdmin?branches[0]?.id:user.branchId);
  const visibleBranches = isAdmin ? branches : branches.filter(b=>b.id===user.branchId);

  useEffect(()=>{
    if(!branches.length) return;
    if(isAdmin){
      const hasSelected=branches.some(b=>b.id===selBranch);
      if(!hasSelected) setSelBranch(branches[0].id);
      return;
    }
    if(selBranch!==user.branchId) setSelBranch(user.branchId);
  },[isAdmin,branches,selBranch,user.branchId]);

  const tabs = isAdmin
    ? [{id:"daily",icon:"📝",label:"Nhập ngày"},{id:"report",icon:"📊",label:"Báo cáo"},{id:"stock",icon:"📦",label:"Tồn kho"},{id:"settings",icon:"⚙️",label:"Cài đặt"}]
    : [{id:"daily",icon:"📝",label:"Nhập ngày"},{id:"report",icon:"📊",label:"Báo cáo"},{id:"stock",icon:"📦",label:"Tồn kho"}];

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Nunito',sans-serif",color:C.text,paddingBottom:80}}>
      {/* Header */}
      <div style={{background:"#ffffff",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22,color:C.gold}}>🥖</span>
          <div>
            <div style={{fontWeight:900,color:C.gold,fontSize:14,lineHeight:1}}>Bánh Mì Chả Cá</div>
            <div style={{fontSize:11,color:C.muted}}>
              {isAdmin ? "👑 Chủ xe" : "👤 Nhân viên"} — {user.name}
            </div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <select value={selBranch} onChange={e=>setSelBranch(e.target.value)} disabled={!isAdmin}
            style={{...inp({width:"auto",padding:"5px 10px",fontSize:12,minWidth:130,opacity:isAdmin?1:0.8,cursor:isAdmin?"pointer":"not-allowed"})}}>
            {visibleBranches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <button onClick={onLogout} style={{...btn("rgba(255,255,255,0.1)"),padding:"6px 12px",fontSize:12}}>Đăng xuất</button>
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:600,margin:"0 auto"}}>
        {tab==="daily"    && <DailyTab user={user} branchId={selBranch} ingredients={ingredients} products={products} getDayData={getDayData} saveDayData={saveDayData} dayKeys={dayKeys} isAdmin={isAdmin} />}
        {tab==="report"   && <ReportTab user={user} branchId={selBranch} branches={branches} ingredients={ingredients} products={products} getDayData={getDayData} dayKeys={dayKeys} isAdmin={isAdmin} />}
        {tab==="stock"    && <StockTab branchId={selBranch} ingredients={ingredients} getDayData={getDayData} />}
        {tab==="settings" && isAdmin && <SettingsTab accounts={accounts} branches={branches} ingredients={ingredients} products={products} saveAccounts={saveAccounts} saveBranches={saveBranches} saveIngredients={saveIngredients} saveProducts={saveProducts} exportBackup={exportBackup} importBackup={importBackup} />}
      </div>

      {/* Bottom nav */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#ffffff",borderTop:`1px solid ${C.border}`,display:"flex"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 4px",border:"none",cursor:"pointer",background:"transparent",color:tab===t.id?C.accent:C.muted,fontFamily:"inherit",borderTop:tab===t.id?`2px solid ${C.accent}`:"2px solid transparent"}}>
            <div style={{fontSize:18}}>{t.icon}</div>
            <div style={{fontSize:10,fontWeight:700}}>{t.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// DAILY TAB
// ═══════════════════════════════════════════════════════
function DailyCard({children,style={}}) {
  return <div style={{background:C.card,borderRadius:14,padding:"14px",margin:"10px 12px",border:`1px solid ${C.border}`,...style}}>{children}</div>;
}

function DailySecBtn({id,label,section,setSection}) {
  return (
    <button onClick={()=>setSection(id)} style={{flex:1,padding:"9px 6px",border:"none",cursor:"pointer",borderRadius:8,background:section===id?C.accent:"rgba(255,255,255,0.06)",color:section===id?"#fff":C.muted,fontWeight:700,fontSize:12,fontFamily:"inherit"}}>
      {label}
    </button>
  );
}

function DailyLabel({children}) {
  return <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",marginBottom:4}}>{children}</div>;
}

function AppCard({children,style={}}) {
  return <div style={{background:C.card,borderRadius:14,padding:14,margin:"10px 12px",border:`1px solid ${C.border}`,...style}}>{children}</div>;
}

function SettingsSecBtn({id,label,sec,setSec}) {
  return <button onClick={()=>setSec(id)} style={{flex:1,padding:"8px 4px",border:"none",cursor:"pointer",borderRadius:8,background:sec===id?C.accent:"rgba(255,255,255,0.06)",color:sec===id?"#fff":C.muted,fontWeight:700,fontSize:11,fontFamily:"inherit"}}>{label}</button>;
}

function DailyTab({user,branchId,ingredients,products,getDayData,saveDayData,dayKeys,isAdmin}) {
  const [date,setDate]=useState(today());
  const [data,setData]=useState(null);
  const [baseStockMap,setBaseStockMap]=useState({});
  const [section,setSection]=useState("ing"); // ing | vh
  const [saved,setSaved]=useState(false);
  const [newVhLabel,setNewVhLabel]=useState("");
  const [vanhanh]=useState(DEF_VANHANH);

  useEffect(()=>{
    getDayData(branchId,date).then(d=>setData(d||{ingredients:{},products:{},vanhanh:{},vhExtra:[],ghichu:"",soldQty:""}));
  },[branchId,date]);

  useEffect(()=>{
    let cancelled=false;
    async function loadBaseStock(){
      if(!branchId||!date){
        setBaseStockMap({});
        return;
      }
      const trackIng=ingredients.filter(x=>x.unit!=="đ"&&x.unit!=="nghìn đ");
      const stock={};
      trackIng.forEach(x=>{ stock[x.id]=0; });

      const previousDay = new Date(`${date}T00:00:00`);
      previousDay.setDate(previousDay.getDate()-1);
      const previousDayStr = previousDay.toISOString().slice(0,10);
      const branchPrefix=`data_${branchId}_`;
      const dates=((dayKeys||[])
        .filter(k=>k.startsWith(branchPrefix))
        .map(k=>k.slice(branchPrefix.length))
        .filter(d=>d<=previousDayStr)
        .sort());

      const results=await Promise.all(dates.map(d=>getDayData(branchId,d).then(day=>({day}))));
      results.forEach(({day})=>{
        if(!day) return;
        trackIng.forEach(x=>{
          const nhap=Number(day.ingredients?.[x.id]?.nhapTon)||0;
          const dung=Number(day.ingredients?.[x.id]?.dungTon)||0;
          const thatThoat=Number(day.ingredients?.[x.id]?.thatThoat)||0;
          stock[x.id]=Math.max(0,(stock[x.id]||0)+nhap-dung-thatThoat);
        });
      });

      if(!cancelled) setBaseStockMap(stock);
    }
    loadBaseStock();
    return ()=>{cancelled=true;};
  },[branchId,date,ingredients,getDayData,dayKeys]);

  if(!data) return <div style={{padding:40,textAlign:"center",color:C.muted}}>Đang tải...</div>;

  const breadIngId = ingredients.find(x=>{
    const n=String(x.name||"").toLowerCase();
    return n.includes("bánh mì") || n.includes("banh mi");
  })?.id;

  const setIng = (id,field,val) => setData(d=>({...d,ingredients:{...d.ingredients,[id]:{...(d.ingredients[id]||{}),[field]:val}}}));
  const setVH = (id,val) => setData(d=>({...d,vanhanh:{...d.vanhanh,[id]:val}}));

  const chiNL = ingredients.reduce((s,x)=>{
    const r=data.ingredients[x.id]||{};
    const theoDoiTon=x.unit!=="đ"&&x.unit!=="nghìn đ";
    const qtyChiPhi=theoDoiTon?toNum(r.nhapTon):toNum(r.qty);
    return s+qtyChiPhi*toNum(r.unitPrice);
  },0);
  const chiVH = Object.values(data.vanhanh||{}).reduce((s,v)=>s+toNum(v),0);
  const tongSP = toNum(data.soldQty);
  const doanhThu = tongSP * 15000;
  const loiLo = doanhThu - chiNL - chiVH;

  const handleSave = async () => {
    await saveDayData(branchId,date,data);
    setSaved(true); setTimeout(()=>setSaved(false),2000);
  };

  return (
    <div>
      <DailyCard>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <DailyLabel>📅 Ngày nhập</DailyLabel>
          <input type="date" value={date} onChange={e=>{setDate(e.target.value);setSaved(false);}}
            style={{...inp({width:"auto",flex:1,minWidth:140})}} />
        </div>
      </DailyCard>

      <div style={{display:"flex",gap:5,padding:"0 12px"}}>
        <DailySecBtn id="ing" section={section} setSection={setSection} label="🛒 Nguyên liệu" />
        {isAdmin && <DailySecBtn id="vh" section={section} setSection={setSection} label="⚙️ Vận hành" />}
      </div>

      {/* ── NGUYÊN LIỆU ── */}
      {section==="ing" && (
        <DailyCard>
          <div style={{fontSize:12,color:C.muted,marginBottom:12}}>
            Chi phí nguyên liệu sẽ tính theo <strong style={{color:C.gold}}>Nhập thêm × Đơn giá</strong>. Số lượng = <strong style={{color:C.gold}}>Tồn ngày hôm trước + Nhập thêm</strong>.
            {!isAdmin && <span> (Nhân viên không xem được tiền nguyên liệu)</span>}
          </div>
          {/* Header */}
          <div style={{display:"grid",gridTemplateColumns:isAdmin?"1fr 90px 90px 80px":"1fr 110px 100px",gap:4,marginBottom:6}}>
            {(!isAdmin?["Nguyên liệu","Số lượng","Còn lại"]:["Nguyên liệu","Số lượng","Đơn giá (đ)","Chi phí"]).map(h=>(
              <div key={h} style={{fontSize:10,color:C.muted,fontWeight:700,textAlign:h!=="Nguyên liệu"?"center":"left"}}>{h}</div>
            ))}
          </div>
          {ingredients.map(x=>{
            const r=data.ingredients[x.id]||{};
            const theoDoiTon=x.unit!=="đ"&&x.unit!=="nghìn đ";
            const tonDau=toNum(baseStockMap[x.id]);
            const nhapTon=toNum(r.nhapTon);
            const dungTon=toNum(r.dungTon);
            const thatThoat=toNum(r.thatThoat);
            const qtyHienTai=theoDoiTon?(tonDau+nhapTon):toNum(r.qty);
            const qtyChiPhi=theoDoiTon?nhapTon:toNum(r.qty);
            const tt=qtyChiPhi*toNum(r.unitPrice);
            const tonCon=Math.max(0,tonDau+nhapTon-dungTon-thatThoat);
            return (
              <div key={x.id} style={{marginBottom:8,padding:"8px",border:`1px solid ${C.border}`,borderRadius:10}}>
                <div style={{display:"grid",gridTemplateColumns:isAdmin?"1fr 90px 90px 80px":"1fr 110px 100px",gap:4,alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:C.text}}>{x.name}</div>
                    <div style={{fontSize:10,color:C.muted}}>đơn vị: {x.unit}</div>
                  </div>
                  <input type="text" inputMode="decimal" value={qtyHienTai||""} placeholder="0" readOnly
                    style={inp({padding:"6px 8px",fontSize:13,textAlign:"center",background:"#f3f4f6"})} />
                  {isAdmin && (
                    <input type="text" inputMode="numeric" value={r.unitPrice||""} placeholder="0"
                      onChange={e=>setIng(x.id,"unitPrice",fmtComma(e.target.value))}
                      style={inp({padding:"6px 8px",fontSize:13,textAlign:"center"})} />
                  )}
                  <div style={{textAlign:"center",fontSize:12,color:tt>0?C.gold:C.muted,fontWeight:700}}>
                    {isAdmin ? (tt>0?fmt(tt):"—") : (theoDoiTon?`${tonCon} ${x.unit}`:"—")}
                  </div>
                </div>
                <div style={{marginTop:6,display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,alignItems:"end"}}>
                  <div>
                    <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:3}}>Nhập thêm</div>
                    <input type="text" inputMode="decimal" value={r.nhapTon||""} placeholder="0"
                      onChange={e=>setIng(x.id,"nhapTon",e.target.value)}
                      style={inp({padding:"6px 8px",fontSize:12,textAlign:"center"})} />
                  </div>
                  <div>
                    <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:3}}>Đã dùng</div>
                    <input type="text" inputMode="decimal" value={r.dungTon||""} placeholder="0"
                      onChange={e=>{
                        const val=e.target.value;
                        setIng(x.id,"dungTon",val);
                        if(x.id===breadIngId){
                          setData(d=>({...d,soldQty:val}));
                        }
                      }}
                      style={inp({padding:"6px 8px",fontSize:12,textAlign:"center"})} />
                  </div>
                  <div>
                    <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:3}}>Thất thoát</div>
                    <input type="text" inputMode="decimal" value={r.thatThoat||""} placeholder="0"
                      onChange={e=>setIng(x.id,"thatThoat",e.target.value)}
                      style={inp({padding:"6px 8px",fontSize:12,textAlign:"center"})} />
                  </div>
                  <div style={{background:"#f9fafb",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
                    <div style={{fontSize:10,color:C.muted,fontWeight:700}}>Còn lại</div>
                    <div style={{fontSize:14,fontWeight:900,color:theoDoiTon?C.text:C.muted}}>{theoDoiTon?tonCon:"—"}</div>
                  </div>
                </div>
                {theoDoiTon && <div style={{marginTop:4,fontSize:10,color:C.muted}}>Tồn ngày hôm trước: {tonDau} {x.unit} · Số lượng hiện tại: {qtyHienTai} {x.unit}</div>}
              </div>
            );
          })}
          <div style={{borderTop:`1px solid ${C.border}`,marginTop:8,paddingTop:10,display:"flex",justifyContent:"space-between"}}>
            <span style={{fontWeight:800,color:C.muted,fontSize:13}}>Tổng chi NL:</span>
            <span style={{fontWeight:900,color:C.accent,fontSize:15}}>{isAdmin?fmt(chiNL):"🔒 Chỉ admin"}</span>
          </div>
          <div style={{marginTop:12}}>
            <DailyLabel>📝 Ghi chú nguyên liệu</DailyLabel>
            <input value={data.ghichu||""} onChange={e=>setData(d=>({...d,ghichu:e.target.value}))}
              placeholder="Ghi chú..." style={inp()} />
          </div>
          <div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${C.border}`}}>
            <DailyLabel>🥖 Đã bán hôm nay (ổ)</DailyLabel>
            <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,alignItems:"center"}}>
              <input type="text" inputMode="numeric" value={data.soldQty||""} onChange={e=>{
                const val=e.target.value;
                setData(d=>{
                  const next={...d,soldQty:val};
                  if(!breadIngId) return next;
                  return {
                    ...next,
                    ingredients:{
                      ...next.ingredients,
                      [breadIngId]:{
                        ...(next.ingredients?.[breadIngId]||{}),
                        dungTon:val,
                      },
                    },
                  };
                });
              }}
                placeholder="Nhập số ổ đã bán" style={inp({padding:"8px 10px",fontSize:14})} />
              <div style={{fontSize:13,fontWeight:800,color:C.gold}}>= {fmt(doanhThu)}</div>
            </div>
            <div style={{fontSize:11,color:C.muted,marginTop:4}}>Doanh thu tính mặc định: số ổ × 15.000đ</div>
          </div>
        </DailyCard>
      )}

      {/* ── VẬN HÀNH (admin only) ── */}
      {section==="vh" && isAdmin && (
        <DailyCard>
          {[...DEF_VANHANH,...(data.vhExtra||[])].map(v=>(
            <div key={v.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{flex:1,fontSize:13,color:C.text,fontWeight:600}}>{v.label}</span>
              <div style={{width:130}}>
                <input type="text" inputMode="numeric" value={data.vanhanh[v.id]||""} placeholder="0 đ"
                  onChange={e=>setVH(v.id,e.target.value)}
                  style={inp({padding:"8px",textAlign:"center"})} />
              </div>
            </div>
          ))}
          <div style={{marginTop:4,paddingTop:8,borderTop:`1px solid ${C.border}`}}>
            <div style={{fontSize:11,color:C.muted,fontWeight:700,marginBottom:6}}>➕ Thêm khoản chi khác</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <input value={newVhLabel} onChange={e=>setNewVhLabel(e.target.value)} placeholder="VD: Khuyến mãi, hỏng hóc..." style={{...inp({flex:1,minWidth:180,padding:"7px 10px",fontSize:12})}} />
              <button onClick={()=>{
                const label=newVhLabel.trim();
                if(!label) return;
                const item={id:`vx_${uid()}`,label};
                setData(d=>({...d,vhExtra:[...(d.vhExtra||[]),item]}));
                setNewVhLabel("");
              }} style={{...btn(`linear-gradient(90deg,${C.accent2},${C.accent})`,{padding:"7px 12px",fontSize:12})}}>
                + Thêm field
              </button>
            </div>
          </div>
          <div style={{borderTop:`1px solid ${C.border}`,marginTop:8,paddingTop:10,display:"flex",justifyContent:"space-between"}}>
            <span style={{fontWeight:800,color:C.muted,fontSize:13}}>Tổng chi VH:</span>
            <span style={{fontWeight:900,color:C.accent,fontSize:15}}>{fmt(chiVH)}</span>
          </div>
        </DailyCard>
      )}

      {/* KẾT QUẢ */}
      <div style={{margin:"10px 12px",background:C.card,borderRadius:14,padding:16,border:`1px solid ${C.borderStrong}`}}>
        <div style={{fontSize:11,color:C.gold,fontWeight:800,letterSpacing:1,marginBottom:10}}>KẾT QUẢ — {fmtD(date)}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          {[[fmt(doanhThu),"Doanh thu","#4ade80"],[fmt(chiNL+chiVH),"Tổng chi","#f87171"],[tongSP+" cái","Đã bán",C.gold]].map(([v,l,c])=>(
            <div key={l} style={{background:"#f9fafb",borderRadius:10,padding:"10px 6px",textAlign:"center",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:13,fontWeight:900,color:c}}>{v}</div>
              <div style={{fontSize:10,color:C.muted,marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:`1px solid ${C.border}`,paddingTop:10}}>
          <span style={{fontWeight:900,fontSize:15}}>Lời / Lỗ hôm nay</span>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:20,fontWeight:900,color:loiLo>=0?"#4ade80":"#f87171"}}>{fmt(Math.abs(loiLo))}</span>
            <span style={{padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:800,background:loiLo>0?"#166534":loiLo<0?"#7f1d1d":"#713f12",color:loiLo>0?"#4ade80":loiLo<0?"#f87171":"#fde68a"}}>
              {loiLo>0?"✅ Lời":loiLo<0?"❌ Lỗ":"⚖️ Hòa"}
            </span>
          </div>
        </div>
      </div>

      <div style={{padding:"0 12px 12px"}}>
        <button onClick={handleSave} style={{...btn(saved?"#166534":`linear-gradient(90deg,${C.accent2},${C.accent})`),width:"100%",padding:14,fontSize:16,borderRadius:12}}>
          {saved?"✅ Đã lưu!":"💾 Lưu ngày này"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// REPORT TAB
// ═══════════════════════════════════════════════════════
function ReportTab({user,branchId,branches,ingredients,products,getDayData,dayKeys,isAdmin}) {
  const [month,setMonth]=useState(today().slice(0,7));
  const [year,setYear]=useState(today().slice(0,4));
  const [exporting,setExporting]=useState(false);
  const [dayDataMap,setDayDataMap]=useState({});
  const [loading,setLoading]=useState(false);

  const branchPrefix=`data_${branchId}_`;
  const branchDayKeys=(dayKeys||[]).filter(k=>k.startsWith(branchPrefix));
  const availableYears=[...new Set(branchDayKeys
    .map(k=>k.slice(branchPrefix.length,branchPrefix.length+4))
    .filter(y=>/^\d{4}$/.test(y)))]
    .sort((a,b)=>b.localeCompare(a));

  useEffect(()=>{
    if(!availableYears.length) return;
    if(!availableYears.includes(year)) setYear(availableYears[0]);
  },[availableYears,year]);

  useEffect(()=>{
    setLoading(true);
    // Generate all dates in month
    const [y,m]=month.split("-").map(Number);
    const days=new Date(y,m,0).getDate();
    const dates=Array.from({length:days},(_,i)=>`${month}-${String(i+1).padStart(2,"0")}`);
    Promise.all(dates.map(d=>getDayData(branchId,d).then(data=>({d,data})))).then(results=>{
      const map={};
      results.forEach(({d,data})=>{ if(data) map[d]=data; });
      setDayDataMap(map);
      setLoading(false);
    });
  },[branchId,month]);

  const calcDay = data => {
    if(!data) return {chiNL:0,chiVH:0,doanhThu:0,tongSP:0};
    const chiNL=ingredients.reduce((s,x)=>{
      const r=data.ingredients?.[x.id]||{};
      const theoDoiTon=x.unit!=="đ"&&x.unit!=="nghìn đ";
      const qtyChiPhi=theoDoiTon?toNum(r.nhapTon):toNum(r.qty);
      return s+qtyChiPhi*toNum(r.unitPrice);
    },0);
    const chiVH=Object.values(data.vanhanh||{}).reduce((s,v)=>s+toNum(v),0);
    const hasSoldQty = data?.soldQty !== undefined;
    const tongSP = hasSoldQty ? toNum(data.soldQty) : products.reduce((s,p)=>s+toNum(data.products?.[p.id]?.qty),0);
    const doanhThu = hasSoldQty ? tongSP*15000 : products.reduce((s,p)=>{const r=data.products?.[p.id]||{};return s+toNum(r.qty)*toNum(r.price||p.price);},0);
    return {chiNL,chiVH,doanhThu,tongSP,loiLo:doanhThu-chiNL-chiVH};
  };

  const dayEntries=Object.entries(dayDataMap).sort(([a],[b])=>b.localeCompare(a));
  const totals=dayEntries.reduce((acc,[,d])=>{
    const c=calcDay(d);
    return {doanhThu:acc.doanhThu+c.doanhThu,chiNL:acc.chiNL+c.chiNL,chiVH:acc.chiVH+c.chiVH,loiLo:acc.loiLo+c.loiLo,tongSP:acc.tongSP+c.tongSP};
  },{doanhThu:0,chiNL:0,chiVH:0,loiLo:0,tongSP:0});

  const exportByDay = () => {
    const rows=[["Ngày","Doanh thu","Chi nguyên liệu","Chi vận hành","Lời/Lỗ","Tổng bánh bán"]];
    [...dayEntries].sort(([a],[b])=>a.localeCompare(b)).forEach(([date,d])=>{
      const c=calcDay(d);
      rows.push([fmtD(date),c.doanhThu,c.chiNL,c.chiVH,c.loiLo,c.tongSP]);
    });
    rows.push(["TỔNG",totals.doanhThu,totals.chiNL,totals.chiVH,totals.loiLo,totals.tongSP]);
    downloadCsv(`doanh-thu-theo-ngay-${branchId}-${month}.csv`,rows);
  };

  const exportByMonth = async () => {
    const y=year||today().slice(0,4);
    setExporting(true);
    try {
      const rows=[["Tháng","Doanh thu","Tổng bánh bán"]];
      for(let m=1;m<=12;m++){
        const mStr=String(m).padStart(2,"0");
        const monthPrefix=`${branchPrefix}${y}-${mStr}-`;
        const keys=branchDayKeys.filter(k=>k.startsWith(monthPrefix));
        let doanhThu=0; let tongSP=0;
        for(const k of keys){
          const date=k.slice(branchPrefix.length);
          const d=await getDayData(branchId,date);
          const c=calcDay(d);
          doanhThu+=c.doanhThu; tongSP+=c.tongSP;
        }
        rows.push([`${mStr}/${y}`,doanhThu,tongSP]);
      }
      downloadCsv(`doanh-thu-theo-thang-${branchId}-${y}.csv`,rows);
    } finally {
      setExporting(false);
    }
  };

  const exportByYear = async () => {
    const years=availableYears.length?availableYears:[today().slice(0,4)];
    setExporting(true);
    try {
      const rows=[["Năm","Doanh thu","Tổng bánh bán"]];
      for(const y of years){
        const yearPrefix=`${branchPrefix}${y}-`;
        const keys=branchDayKeys.filter(k=>k.startsWith(yearPrefix));
        let doanhThu=0; let tongSP=0;
        for(const k of keys){
          const date=k.slice(branchPrefix.length);
          const d=await getDayData(branchId,date);
          const c=calcDay(d);
          doanhThu+=c.doanhThu; tongSP+=c.tongSP;
        }
        rows.push([y,doanhThu,tongSP]);
      }
      downloadCsv(`doanh-thu-theo-nam-${branchId}.csv`,rows);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <AppCard>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <span style={{color:C.muted,fontSize:13,fontWeight:700}}>📊 Tháng:</span>
          <input type="month" value={month} onChange={e=>setMonth(e.target.value)} style={{...inp({width:"auto",flex:1})}} />
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <span style={{color:C.muted,fontSize:12,fontWeight:700}}>Năm:</span>
          <select value={year} onChange={e=>setYear(e.target.value)} style={{...inp({width:"auto",padding:"6px 10px",fontSize:12,minWidth:100})}}>
            {(availableYears.length?availableYears:[today().slice(0,4)]).map(y=><option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={exportByDay} disabled={loading||exporting} style={{...btn("#e5e7eb",{padding:"7px 10px",fontSize:12})}}>⬇️ Excel ngày</button>
          <button onClick={exportByMonth} disabled={exporting} style={{...btn("#e5e7eb",{padding:"7px 10px",fontSize:12})}}>⬇️ Excel tháng</button>
          <button onClick={exportByYear} disabled={exporting} style={{...btn("#e5e7eb",{padding:"7px 10px",fontSize:12})}}>⬇️ Excel năm</button>
        </div>
      </AppCard>

      {/* Tổng tháng */}
      <div style={{margin:"0 12px",background:C.card,borderRadius:14,padding:16,border:`1px solid ${C.borderStrong}`}}>
        <div style={{fontSize:11,color:C.gold,fontWeight:800,letterSpacing:1,marginBottom:10}}>TỔNG THÁNG — {dayEntries.length} ngày KD</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          {(isAdmin
            ? [[fmt(totals.doanhThu),"💰 Doanh thu","#4ade80"],[fmt(totals.chiNL),"🛒 Chi NL","#f87171"],[fmt(totals.chiVH),"⚙️ Chi VH","#fb923c"],[totals.tongSP+" cái","🥖 Tổng bán",C.gold]]
            : [[fmt(totals.doanhThu),"💰 Doanh thu","#4ade80"],[fmt(totals.chiVH),"⚙️ Chi VH","#fb923c"],[totals.tongSP+" cái","🥖 Tổng bán",C.gold]])
            .map(([v,l,c])=>(
            <div key={l} style={{background:"#f9fafb",borderRadius:10,padding:"10px 12px",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:11,color:C.muted,marginBottom:3}}>{l}</div>
              <div style={{fontSize:16,fontWeight:900,color:c}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{borderTop:`1px solid ${C.border}`,paddingTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontWeight:800,fontSize:14}}>Tổng Lời / Lỗ</span>
          <span style={{fontSize:20,fontWeight:900,color:totals.loiLo>=0?"#4ade80":"#f87171"}}>{totals.loiLo>=0?"+":""}{fmt(totals.loiLo)}</span>
        </div>
        {dayEntries.length>0 && (
          <div style={{marginTop:8,borderTop:`1px solid ${C.border}`,paddingTop:8,display:"flex",justifyContent:"space-between",fontSize:12,color:C.muted,flexWrap:"wrap",gap:4}}>
            <span>DT TB/ngày: <strong style={{color:C.gold}}>{fmt(Math.round(totals.doanhThu/dayEntries.length))}</strong></span>
            <span>Lời TB/ngày: <strong style={{color:totals.loiLo>=0?"#4ade80":"#f87171"}}>{fmt(Math.round(totals.loiLo/dayEntries.length))}</strong></span>
          </div>
        )}
      </div>

      {/* Bảng từng ngày */}
      {loading ? <div style={{padding:30,textAlign:"center",color:C.muted}}>Đang tải...</div> : (
        dayEntries.length===0
          ? <div style={{padding:30,textAlign:"center",color:C.muted}}>Không có dữ liệu tháng này</div>
            : <AppCard style={{padding:0,overflow:"hidden"}}>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead>
                    <tr>{(isAdmin?["Ngày","Doanh thu","Chi NL","Chi VH","Lời/Lỗ","Bánh"]:["Ngày","Doanh thu","Chi VH","Lời/Lỗ","Bánh"]).map(h=>(
                      <th key={h} style={{background:"#2d1400",color:C.gold,padding:"8px 6px",textAlign:"center",fontWeight:700,whiteSpace:"nowrap"}}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {dayEntries.map(([date,d])=>{
                      const c=calcDay(d);
                      return <tr key={date} style={{background:c.loiLo>0?"rgba(34,197,94,0.05)":c.loiLo<0?"rgba(239,68,68,0.05)":"transparent"}}>
                        <td style={{padding:"7px 6px",borderBottom:`1px solid ${C.border}`,textAlign:"center",fontWeight:700,color:C.gold,whiteSpace:"nowrap"}}>{fmtD(date)}</td>
                        <td style={{padding:"7px 6px",borderBottom:`1px solid ${C.border}`,textAlign:"center",color:"#4ade80",fontWeight:700}}>{fmt(c.doanhThu)}</td>
                        {isAdmin && <td style={{padding:"7px 6px",borderBottom:`1px solid ${C.border}`,textAlign:"center",color:"#f87171"}}>{fmt(c.chiNL)}</td>}
                        <td style={{padding:"7px 6px",borderBottom:`1px solid ${C.border}`,textAlign:"center",color:"#fb923c"}}>{fmt(c.chiVH)}</td>
                        <td style={{padding:"7px 6px",borderBottom:`1px solid ${C.border}`,textAlign:"center",fontWeight:800,color:c.loiLo>=0?"#4ade80":"#f87171"}}>{c.loiLo>=0?"+":""}{fmt(c.loiLo)}</td>
                        <td style={{padding:"7px 6px",borderBottom:`1px solid ${C.border}`,textAlign:"center",color:C.muted}}>{c.tongSP}</td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
            </AppCard>
      )}

      {/* Phân tích sản phẩm */}
      {dayEntries.length>0 && (
        <AppCard>
          <div style={{fontWeight:800,color:C.gold,marginBottom:12,fontSize:14}}>🥖 Sản phẩm bán chạy trong tháng</div>
          {products.map(p=>{
            const total=dayEntries.reduce((s,[,d])=>s+(Number(d?.products?.[p.id]?.qty)||0),0);
            const pct=totals.tongSP>0?Math.round(total/totals.tongSP*100):0;
            return (
              <div key={p.id} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                  <span style={{color:C.text,fontWeight:600}}>{p.name}</span>
                  <span style={{color:C.gold,fontWeight:700}}>{total} cái ({pct}%) — {fmt(total*p.price)}</span>
                </div>
                <div style={{background:"rgba(255,255,255,0.08)",borderRadius:99,height:6}}>
                  <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${C.accent2},${C.accent})`,borderRadius:99}} />
                </div>
              </div>
            );
          })}
        </AppCard>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// STOCK TAB
// ═══════════════════════════════════════════════════════
function StockTab({branchId,ingredients,getDayData}) {
  const [stockMap,setStockMap]=useState({});
  const [historyMap,setHistoryMap]=useState({});
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    // Load last 30 days
    const dates=Array.from({length:30},(_,i)=>{
      const d=new Date(); d.setDate(d.getDate()-i); return d.toISOString().slice(0,10);
    }).reverse();
    Promise.all(dates.map(d=>getDayData(branchId,d).then(data=>({d,data})))).then(results=>{
      const stock={};
      const hist={};
      ingredients.filter(x=>x.unit!=="đ"&&x.unit!=="nghìn đ").forEach(x=>{ stock[x.id]=0; hist[x.id]=[]; });
      results.forEach(({d,data})=>{
        if(!data) return;
        ingredients.filter(x=>x.unit!=="đ"&&x.unit!=="nghìn đ").forEach(x=>{
          const nhap=Number(data.ingredients?.[x.id]?.nhapTon)||0;
          const dung=Number(data.ingredients?.[x.id]?.dungTon)||0;
          const thatThoat=Number(data.ingredients?.[x.id]?.thatThoat)||0;
          if(nhap>0||dung>0||thatThoat>0) {
            const truoc=stock[x.id]||0;
            stock[x.id]=Math.max(0,truoc+nhap-dung-thatThoat);
            hist[x.id]=[...hist[x.id],{date:d,nhap,dung,thatThoat,conLai:stock[x.id]}];
          }
        });
      });
      setStockMap(stock); setHistoryMap(hist); setLoading(false);
    });
  },[branchId,ingredients]);

  const trackIng=ingredients.filter(x=>x.unit!=="đ"&&x.unit!=="nghìn đ");

  if(loading) return <div style={{padding:40,textAlign:"center",color:C.muted}}>Đang tải...</div>;

  const empty=trackIng.filter(x=>(stockMap[x.id]||0)===0);

  return (
    <div>
      {empty.length>0 && (
        <div style={{margin:"10px 12px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.4)",borderRadius:14,padding:14}}>
          <div style={{fontWeight:800,color:"#fca5a5",marginBottom:8}}>⚠️ Hàng cần nhập thêm</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {empty.map(x=><span key={x.id} style={{background:"rgba(239,68,68,0.2)",color:"#fca5a5",borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:700}}>{x.name}</span>)}
          </div>
        </div>
      )}
      <AppCard>
        <div style={{fontWeight:800,color:C.gold,fontSize:14,marginBottom:2}}>📦 Tồn kho hiện tại</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:14}}>Dựa trên dữ liệu nhập/dùng 30 ngày gần nhất</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {trackIng.map(x=>{
            const sl=stockMap[x.id]||0;
            const low=sl===0;
            return (
              <div key={x.id} style={{background:low?"rgba(239,68,68,0.1)":"rgba(34,197,94,0.08)",border:`1px solid ${low?"rgba(239,68,68,0.3)":"rgba(34,197,94,0.25)"}`,borderRadius:10,padding:"12px",textAlign:"center"}}>
                <div style={{fontSize:11,color:low?"#fca5a5":"#86efac",fontWeight:700,marginBottom:4}}>{x.name}</div>
                <div style={{fontSize:24,fontWeight:900,color:low?"#f87171":"#4ade80"}}>{sl}</div>
                <div style={{fontSize:11,color:C.muted}}>{x.unit}</div>
                {low&&<div style={{fontSize:10,color:"#f87171",fontWeight:700,marginTop:2}}>⚠️ Hết!</div>}
              </div>
            );
          })}
        </div>
      </AppCard>
      <div style={{padding:"4px 12px",fontSize:13,color:C.muted}}>
        💡 Để cập nhật tồn kho: vào <strong style={{color:C.gold}}>📝 Nhập ngày</strong> → mục nguyên liệu có thêm ô "Nhập thêm", "Đã dùng" và "Thất thoát"
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SETTINGS TAB (Admin only)
// ═══════════════════════════════════════════════════════
function SettingsTab({accounts,branches,ingredients,products,saveAccounts,saveBranches,saveIngredients,saveProducts,exportBackup,importBackup}) {
  const [sec,setSec]=useState("ing"); // ing | prod | branch | acc | backup

  return (
    <div>
      <div style={{display:"flex",gap:4,padding:"10px 12px 0"}}>
        <SettingsSecBtn id="ing" sec={sec} setSec={setSec} label="🛒 NL" />
        <SettingsSecBtn id="prod" sec={sec} setSec={setSec} label="🥖 SP" />
        <SettingsSecBtn id="branch" sec={sec} setSec={setSec} label="🏪 Chi nhánh" />
        <SettingsSecBtn id="acc" sec={sec} setSec={setSec} label="👤 Tài khoản" />
        <SettingsSecBtn id="backup" sec={sec} setSec={setSec} label="💾 Sao lưu" />
      </div>

      {sec==="ing"    && <IngredientsSettings ingredients={ingredients} saveIngredients={saveIngredients} />}
      {sec==="prod"   && <ProductsSettings products={products} saveProducts={saveProducts} />}
      {sec==="branch" && <BranchSettings branches={branches} saveBranches={saveBranches} />}
      {sec==="acc"    && <AccountSettings accounts={accounts} branches={branches} saveAccounts={saveAccounts} />}
      {sec==="backup" && <BackupSettings exportBackup={exportBackup} importBackup={importBackup} />}
    </div>
  );
}

function BackupSettings({exportBackup,importBackup}) {
  const [importing,setImporting]=useState(false);
  const [msg,setMsg]=useState("");

  const onPick = async e => {
    const f=e.target.files?.[0];
    if(!f) return;
    try {
      setImporting(true); setMsg("");
      await importBackup(f);
      setMsg("✅ Đã import dữ liệu thành công");
    } catch (err) {
      setMsg(`❌ Import lỗi: ${err?.message||"File không hợp lệ"}`);
    } finally {
      setImporting(false);
      e.target.value="";
    }
  };

  return (
    <AppCard>
      <div style={{fontWeight:800,color:C.gold,fontSize:14,marginBottom:8}}>💾 Sao lưu / Khôi phục dữ liệu</div>
      <div style={{fontSize:12,color:C.muted,marginBottom:12}}>
        Xuất toàn bộ dữ liệu ra file JSON rồi tải lên Google Drive. Khi cần, chọn file JSON để khôi phục lại.
      </div>

      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
        <button onClick={exportBackup} style={{...btn(`linear-gradient(90deg,${C.accent2},${C.accent})`),padding:"9px 14px",fontSize:13}}>
          ⬇️ Xuất file backup JSON
        </button>
        <label style={{...btn("rgba(59,130,246,0.3)",{padding:"9px 14px",fontSize:13,display:"inline-flex",alignItems:"center"}),opacity:importing?0.7:1}}>
          {importing?"⏳ Đang import...":"⬆️ Import từ JSON"}
          <input type="file" accept="application/json,.json" onChange={onPick} disabled={importing} style={{display:"none"}} />
        </label>
      </div>

      {msg && <div style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",fontSize:12,color:C.text}}>{msg}</div>}
    </AppCard>
  );
}

// ── Ingredients Settings ──────────────────────────────
function IngredientsSettings({ingredients,saveIngredients}) {
  const [list,setList]=useState(ingredients);
  const [newName,setNewName]=useState(""); const [newUnit,setNewUnit]=useState("");
  const [editing,setEditing]=useState(null);

  const add = () => {
    if(!newName.trim()) return;
    const updated=[...list,{id:uid(),name:newName.trim(),unit:newUnit.trim()||"cái"}];
    setList(updated); saveIngredients(updated); setNewName(""); setNewUnit("");
  };
  const del = id => { const u=list.filter(x=>x.id!==id); setList(u); saveIngredients(u); };
  const edit = (id,field,val) => {
    const u=list.map(x=>x.id===id?{...x,[field]:val}:x); setList(u); saveIngredients(u);
  };

  const UNITS=["kg","lít","chai","ổ","quả","cái","bó","nghìn đ","kg thùng","túi"];
  return (
    <AppCard>
      <div style={{fontWeight:800,color:C.gold,fontSize:14,marginBottom:12}}>🛒 Quản lý nguyên liệu</div>
      {list.map((x,i)=>(
        <div key={x.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,padding:"8px 10px",background:"rgba(255,255,255,0.04)",borderRadius:10}}>
          <div style={{flex:1}}>
            {editing===x.id ? (
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                <input value={x.name} onChange={e=>edit(x.id,"name",e.target.value)} style={{...inp({flex:1,padding:"5px 8px",fontSize:13,minWidth:100})}} />
                <select value={x.unit} onChange={e=>edit(x.id,"unit",e.target.value)} style={{...inp({width:80,padding:"5px 6px",fontSize:12})}}>
                  {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
                </select>
                <button onClick={()=>setEditing(null)} style={{...btn("#166534",{padding:"5px 10px",fontSize:12})}}>✓</button>
              </div>
            ) : (
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:13,color:C.text,fontWeight:600}}>{x.name}</span>
                <span style={{fontSize:11,color:C.muted,background:"rgba(255,255,255,0.08)",borderRadius:6,padding:"1px 7px"}}>{x.unit}</span>
              </div>
            )}
          </div>
          <button onClick={()=>setEditing(editing===x.id?null:x.id)} style={{...btn("rgba(59,130,246,0.3)",{padding:"5px 10px",fontSize:12})}}>✏️</button>
          <button onClick={()=>del(x.id)} style={{...btn("rgba(239,68,68,0.3)",{padding:"5px 10px",fontSize:12})}}>🗑️</button>
        </div>
      ))}
      {/* Add new */}
      <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12,marginTop:8}}>
        <div style={{fontSize:12,color:C.gold,fontWeight:700,marginBottom:8}}>➕ Thêm nguyên liệu mới</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Tên nguyên liệu" style={{...inp({flex:2,minWidth:120,padding:"8px 10px"})}} onKeyDown={e=>e.key==="Enter"&&add()} />
          <input value={newUnit} onChange={e=>setNewUnit(e.target.value)} placeholder="Đơn vị (vd: kg, chai...)" style={{...inp({flex:1,minWidth:120,padding:"8px 10px"})}} />
          <button onClick={add} style={{...btn(`linear-gradient(90deg,${C.accent2},${C.accent})`),padding:"8px 16px",fontSize:14,whiteSpace:"nowrap"}}>+ Thêm</button>
        </div>
      </div>
    </AppCard>
  );
}

// ── Products Settings ─────────────────────────────────
function ProductsSettings({products,saveProducts}) {
  const [list,setList]=useState(products);
  const [newName,setNewName]=useState(""); const [newPrice,setNewPrice]=useState("15000");
  const [editing,setEditing]=useState(null);

  const add = () => {
    if(!newName.trim()) return;
    const u=[...list,{id:uid(),name:newName.trim(),price:toNum(newPrice)||15000}];
    setList(u); saveProducts(u); setNewName(""); setNewPrice("15000");
  };
  const del = id => { const u=list.filter(x=>x.id!==id); setList(u); saveProducts(u); };
  const edit = (id,field,val) => { const u=list.map(x=>x.id===id?{...x,[field]:field==="price"?toNum(val):val}:x); setList(u); saveProducts(u); };

  return (
    <AppCard>
      <div style={{fontWeight:800,color:C.gold,fontSize:14,marginBottom:12}}>🥖 Quản lý sản phẩm</div>
      {list.map(x=>(
        <div key={x.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,padding:"8px 10px",background:"rgba(255,255,255,0.04)",borderRadius:10}}>
          <div style={{flex:1}}>
            {editing===x.id ? (
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                <input value={x.name} onChange={e=>edit(x.id,"name",e.target.value)} style={{...inp({flex:2,padding:"5px 8px",fontSize:13,minWidth:120})}} />
                <input type="text" inputMode="numeric" value={fmtComma(x.price)} onChange={e=>edit(x.id,"price",e.target.value)} style={{...inp({width:90,padding:"5px 8px",fontSize:13,textAlign:"center"})}} />
                <button onClick={()=>setEditing(null)} style={{...btn("#166534",{padding:"5px 10px",fontSize:12})}}>✓</button>
              </div>
            ) : (
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:13,color:C.text,fontWeight:600}}>{x.name}</span>
                <span style={{fontSize:12,color:C.gold,fontWeight:800}}>{fmt(x.price)}</span>
              </div>
            )}
          </div>
          <button onClick={()=>setEditing(editing===x.id?null:x.id)} style={{...btn("rgba(59,130,246,0.3)",{padding:"5px 10px",fontSize:12})}}>✏️</button>
          <button onClick={()=>del(x.id)} style={{...btn("rgba(239,68,68,0.3)",{padding:"5px 10px",fontSize:12})}}>🗑️</button>
        </div>
      ))}
      <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12,marginTop:8}}>
        <div style={{fontSize:12,color:C.gold,fontWeight:700,marginBottom:8}}>➕ Thêm sản phẩm mới</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Tên sản phẩm" style={{...inp({flex:2,minWidth:120,padding:"8px 10px"})}} />
          <input type="text" inputMode="numeric" value={fmtComma(newPrice)} onChange={e=>setNewPrice(fmtComma(e.target.value))} placeholder="Giá" style={{...inp({width:90,padding:"8px 8px",textAlign:"center"})}} />
          <button onClick={add} style={{...btn(`linear-gradient(90deg,${C.accent2},${C.accent})`),padding:"8px 16px",fontSize:14}}>+ Thêm</button>
        </div>
      </div>
    </AppCard>
  );
}

// ── Branch Settings ───────────────────────────────────
function BranchSettings({branches,saveBranches}) {
  const [list,setList]=useState(branches);
  const [newName,setNewName]=useState("");

  const add = () => {
    if(!newName.trim()) return;
    const u=[...list,{id:uid(),name:newName.trim()}];
    setList(u); saveBranches(u); setNewName("");
  };
  const del = id => { if(list.length<=1){alert("Phải có ít nhất 1 chi nhánh!");return;} const u=list.filter(x=>x.id!==id); setList(u); saveBranches(u); };
  const edit = (id,val) => { const u=list.map(x=>x.id===id?{...x,name:val}:x); setList(u); saveBranches(u); };

  return (
    <AppCard>
      <div style={{fontWeight:800,color:C.gold,fontSize:14,marginBottom:12}}>🏪 Quản lý chi nhánh</div>
      {list.map(b=>(
        <div key={b.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,padding:"10px",background:"rgba(255,255,255,0.04)",borderRadius:10}}>
          <input value={b.name} onChange={e=>edit(b.id,e.target.value)} style={{...inp({flex:1,padding:"6px 10px"})}} />
          {list.length>1 && <button onClick={()=>del(b.id)} style={{...btn("rgba(239,68,68,0.3)",{padding:"6px 10px",fontSize:12})}}>🗑️</button>}
        </div>
      ))}
      <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12,marginTop:8,display:"flex",gap:8}}>
        <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Tên chi nhánh mới" style={{...inp({flex:1,padding:"8px 10px"})}} onKeyDown={e=>e.key==="Enter"&&add()} />
        <button onClick={add} style={{...btn(`linear-gradient(90deg,${C.accent2},${C.accent})`),padding:"8px 16px",whiteSpace:"nowrap"}}>+ Thêm</button>
      </div>
    </AppCard>
  );
}

// ── Account Settings ──────────────────────────────────
function AccountSettings({accounts,branches,saveAccounts}) {
  const [list,setList]=useState(accounts);
  const [form,setForm]=useState({username:"",password:"",name:"",role:"staff",branchId:branches[0]?.id||""});
  const [showAdd,setShowAdd]=useState(false);
  const [editId,setEditId]=useState(null);
  const [editPw,setEditPw]=useState({});

  const add = () => {
    if(!form.username||!form.password||!form.name){alert("Điền đầy đủ thông tin!");return;}
    if(list.find(a=>a.username===form.username)){alert("Username đã tồn tại!");return;}
    const u=[...list,{id:uid(),...form,active:true}];
    setList(u); saveAccounts(u); setForm({username:"",password:"",name:"",role:"staff",branchId:branches[0]?.id||""}); setShowAdd(false);
  };
  const del = id => { if(!window.confirm("Xoá tài khoản này?"))return; const u=list.filter(a=>a.id!==id); setList(u); saveAccounts(u); };
  const changeRole = (id,role) => { const u=list.map(a=>a.id===id?{...a,role}:a); setList(u); saveAccounts(u); };
  const changeBranch = (id,branchId) => { const u=list.map(a=>a.id===id?{...a,branchId}:a); setList(u); saveAccounts(u); };
  const changePw = id => { const pw=editPw[id]; if(!pw||pw.length<4){alert("Mật khẩu tối thiểu 4 ký tự!");return;} const u=list.map(a=>a.id===id?{...a,password:pw}:a); setList(u); saveAccounts(u); setEditPw(p=>({...p,[id]:""})); setEditId(null); };
  const toggleActive = id => {
    const u=list.map(a=>a.id===id?{...a,active:a.role==="admin"?true:!(a.active!==false)}:a);
    setList(u); saveAccounts(u);
  };

  return (
    <AppCard>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontWeight:800,color:C.gold,fontSize:14}}>👤 Quản lý tài khoản</div>
        <button onClick={()=>setShowAdd(!showAdd)} style={{...btn(`linear-gradient(90deg,${C.accent2},${C.accent})`),padding:"7px 12px",fontSize:12}}>+ Thêm tài khoản</button>
      </div>

      {showAdd && (
        <div style={{background:"rgba(255,255,255,0.05)",borderRadius:10,padding:14,marginBottom:14,border:`1px solid ${C.borderStrong}`}}>
          <div style={{fontWeight:700,color:C.gold,fontSize:13,marginBottom:10}}>Tài khoản mới</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <div><div style={{fontSize:11,color:C.muted,marginBottom:3}}>Họ tên</div><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Tên nhân viên" style={inp({padding:"7px 10px",fontSize:13})} /></div>
            <div><div style={{fontSize:11,color:C.muted,marginBottom:3}}>Username</div><input value={form.username} onChange={e=>setForm(f=>({...f,username:e.target.value}))} placeholder="username" style={inp({padding:"7px 10px",fontSize:13})} /></div>
            <div><div style={{fontSize:11,color:C.muted,marginBottom:3}}>Mật khẩu</div><input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="••••••" style={inp({padding:"7px 10px",fontSize:13})} /></div>
            <div><div style={{fontSize:11,color:C.muted,marginBottom:3}}>Chi nhánh</div>
              <select value={form.branchId} onChange={e=>setForm(f=>({...f,branchId:e.target.value}))} style={inp({padding:"7px 10px",fontSize:13})}>
                {branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:3}}>Quyền hạn</div>
            <div style={{display:"flex",gap:8}}>
              {[["admin","👑 Chủ / Admin"],["staff","👤 Nhân viên"]].map(([v,l])=>(
                <label key={v} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:13,color:form.role===v?C.gold:C.muted,fontWeight:form.role===v?700:400}}>
                  <input type="radio" value={v} checked={form.role===v} onChange={()=>setForm(f=>({...f,role:v}))} />
                  {l}
                </label>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={add} style={{...btn(`linear-gradient(90deg,${C.accent2},${C.accent})`),flex:1,padding:"9px"}}>Tạo tài khoản</button>
            <button onClick={()=>setShowAdd(false)} style={{...btn("rgba(255,255,255,0.1)"),padding:"9px 14px"}}>Huỷ</button>
          </div>
        </div>
      )}

      {list.map(a=>(
        <div key={a.id} style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"12px",marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div>
              <div style={{fontWeight:800,color:C.text,fontSize:14}}>{a.name}</div>
              <div style={{fontSize:11,color:C.muted}}>
                @{a.username} · {a.role==="admin"?"👑 Admin":"👤 Nhân viên"}
                {a.role==="staff" && <span> · {a.active!==false?"🟢 Active":"🔴 Inactive"}</span>}
              </div>
            </div>
            <div style={{display:"flex",gap:5}}>
              {a.role==="staff" && (
                <button onClick={()=>toggleActive(a.id)} style={{...btn(a.active!==false?"rgba(34,197,94,0.25)":"rgba(239,68,68,0.25)",{padding:"4px 8px",fontSize:11})}}>
                  {a.active!==false?"Active":"Inactive"}
                </button>
              )}
              <button onClick={()=>setEditId(editId===a.id?null:a.id)} style={{...btn("rgba(59,130,246,0.3)",{padding:"4px 8px",fontSize:11})}}>✏️</button>
              <button onClick={()=>del(a.id)} style={{...btn("rgba(239,68,68,0.3)",{padding:"4px 8px",fontSize:11})}}>🗑️</button>
            </div>
          </div>
          {editId===a.id && (
            <div style={{borderTop:`1px solid ${C.border}`,paddingTop:10,display:"flex",flexDirection:"column",gap:8}}>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <select value={a.role} onChange={e=>changeRole(a.id,e.target.value)} style={inp({flex:1,padding:"6px 8px",fontSize:12,minWidth:120})}>
                  <option value="admin">👑 Admin</option>
                  <option value="staff">👤 Nhân viên</option>
                </select>
                <select value={a.branchId} onChange={e=>changeBranch(a.id,e.target.value)} style={inp({flex:1,padding:"6px 8px",fontSize:12,minWidth:100})}>
                  {branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div style={{display:"flex",gap:8}}>
                <input type="password" value={editPw[a.id]||""} onChange={e=>setEditPw(p=>({...p,[a.id]:e.target.value}))} placeholder="Mật khẩu mới" style={{...inp({flex:1,padding:"6px 10px",fontSize:12})}} />
                <button onClick={()=>changePw(a.id)} style={{...btn("#166534",{padding:"6px 12px",fontSize:12})}}>Đổi MK</button>
              </div>
            </div>
          )}
          <div style={{fontSize:11,color:C.muted}}>Chi nhánh: {branches.find(b=>b.id===a.branchId)?.name||"—"}</div>
        </div>
      ))}
    </AppCard>
  );
}

// ═══════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════
export default function Root() {
  const [screen,setScreen]=useState("login");
  const [user,setUser]=useState(null);
  const [accounts,setAccounts]=useState([]);
  const [branches,setBranches]=useState([]);
  const [ingredients,setIngredients]=useState([]);
  const [products,setProducts]=useState([]);
  const [dayKeys,setDayKeys]=useState([]);
  const [loaded,setLoaded]=useState(false);

  useEffect(()=>{
    async function init(){
      let accs=await DB.get("sys_accounts");
      let brs=await DB.get("sys_branches");
      let ings=await DB.get("sys_ingredients");
      let prods=await DB.get("sys_products");
      let dkeys=await DB.get("sys_day_keys");
      if(!accs){accs=DEF_ACCOUNTS;await DB.set("sys_accounts",accs);}
      if(Array.isArray(accs)){
        const normalized=accs.map(a=>a.role==="staff"&&a.active===undefined?{...a,active:true}:a);
        const changed=normalized.some((a,i)=>a!==accs[i]);
        if(changed){
          accs=normalized;
          await DB.set("sys_accounts",accs);
        }
      }
      if(!brs){brs=DEF_BRANCHES;await DB.set("sys_branches",brs);}
      if(!ings){ings=DEF_INGREDIENTS;await DB.set("sys_ingredients",ings);}
      if(!prods){prods=DEF_PRODUCTS;await DB.set("sys_products",prods);}
      if(!Array.isArray(dkeys)){dkeys=[];await DB.set("sys_day_keys",dkeys);}
      setAccounts(accs);setBranches(brs);setIngredients(ings);setProducts(prods);setDayKeys(dkeys);setLoaded(true);
    }
    init();
  },[]);

  if(!loaded) return (
    <div style={{minHeight:"100vh",background:"#ffffff",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12,fontFamily:"'Nunito',sans-serif"}}>
      <div style={{fontSize:48,color:C.gold}}>🥖</div>
      <div style={{color:C.text,fontSize:18,fontWeight:700}}>Đang tải hệ thống...</div>
    </div>
  );

  const saveAccounts=async a=>{setAccounts(a);await DB.set("sys_accounts",a);};
  const saveBranches=async b=>{setBranches(b);await DB.set("sys_branches",b);};
  const saveIngredients=async i=>{setIngredients(i);await DB.set("sys_ingredients",i);};
  const saveProducts=async p=>{setProducts(p);await DB.set("sys_products",p);};

  const getDayData=async(branchId,date)=>await DB.get(`data_${branchId}_${date}`)||{ingredients:{},products:{},vanhanh:{},ghichu:""};
  const saveDayData=async(branchId,date,data)=>{
    const key=`data_${branchId}_${date}`;
    await DB.set(key,data);
    if(!dayKeys.includes(key)){
      const updated=[...dayKeys,key];
      setDayKeys(updated);
      await DB.set("sys_day_keys",updated);
    }
  };

  const exportBackup=async()=>{
    const dayData={};
    for(const k of dayKeys){
      const d=await DB.get(k);
      if(d) dayData[k]=d;
    }
    const payload={
      version:1,
      exportedAt:new Date().toISOString(),
      sys:{accounts,branches,ingredients,products},
      dayKeys,
      dayData,
    };
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json;charset=utf-8"});
    const a=document.createElement("a");
    const url=URL.createObjectURL(blob);
    a.href=url;
    a.download=`banhmi-backup-${today()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const importBackup=async(file)=>{
    const text=await file.text();
    let parsed;
    try { parsed=JSON.parse(text); } catch { throw new Error("JSON không hợp lệ"); }

    const sys=parsed?.sys||{};
    const nextAccounts=Array.isArray(sys.accounts)?sys.accounts:null;
    const nextBranches=Array.isArray(sys.branches)?sys.branches:null;
    const nextIngredients=Array.isArray(sys.ingredients)?sys.ingredients:null;
    const nextProducts=Array.isArray(sys.products)?sys.products:null;
    if(!nextAccounts||!nextBranches||!nextIngredients||!nextProducts) throw new Error("Thiếu dữ liệu hệ thống");

    const importedDayData=parsed?.dayData||{};
    const importedDayKeys=Array.isArray(parsed?.dayKeys)
      ? parsed.dayKeys
      : Object.keys(importedDayData).filter(k=>k.startsWith("data_"));

    await DB.set("sys_accounts",nextAccounts);
    await DB.set("sys_branches",nextBranches);
    await DB.set("sys_ingredients",nextIngredients);
    await DB.set("sys_products",nextProducts);

    for(const k of importedDayKeys){
      if(importedDayData[k]!==undefined) await DB.set(k,importedDayData[k]);
    }
    await DB.set("sys_day_keys",importedDayKeys);

    setAccounts(nextAccounts);
    setBranches(nextBranches);
    setIngredients(nextIngredients);
    setProducts(nextProducts);
    setDayKeys(importedDayKeys);
  };

  const handleLogin=(u,p)=>{
    const acc=accounts.find(a=>a.username===u&&a.password===p);
    if(!acc)return false;
    if(acc.role==="staff"&&acc.active===false)return false;
    setUser(acc);setScreen("app");return true;
  };

  const handleForgotPassword=async(username,name,newPassword)=>{
    const u=(username||"").trim();
    const n=(name||"").trim().toLowerCase();
    const pw=(newPassword||"").trim();
    if(!u||!n||!pw) return {ok:false,msg:"Điền đủ username, họ tên, mật khẩu mới"};
    if(pw.length<4) return {ok:false,msg:"Mật khẩu tối thiểu 4 ký tự"};
    const idx=accounts.findIndex(a=>a.username===u&&String(a.name||"").trim().toLowerCase()===n);
    if(idx<0) return {ok:false,msg:"Không tìm thấy tài khoản khớp thông tin"};
    const updated=accounts.map((a,i)=>i===idx?{...a,password:pw}:a);
    setAccounts(updated);
    await DB.set("sys_accounts",updated);
    return {ok:true};
  };

  if(screen==="login") return <LoginScreen onLogin={handleLogin} onForgotPassword={handleForgotPassword} />;
  return (
    <MainApp
      user={user} accounts={accounts} branches={branches} ingredients={ingredients} products={products}
      saveAccounts={saveAccounts} saveBranches={saveBranches} saveIngredients={saveIngredients} saveProducts={saveProducts}
      getDayData={getDayData} saveDayData={saveDayData}
      dayKeys={dayKeys}
      exportBackup={exportBackup} importBackup={importBackup}
      onLogout={()=>{setUser(null);setScreen("login");}}
    />
  );
}
