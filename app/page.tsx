"use client";

import { useMemo, useState } from "react";
import { BarcodeMatch, CalendarCheckIn, NewProduct, Product, RoutineStep } from "@/src/domain/models";
import { createServiceContainer } from "@/src/services/container";
import { useProductTracking } from "@/src/features/products/use-product-tracking";
import { useRoutine } from "@/src/features/routines/use-routine";
import { RoutineEditorSheet } from "@/src/features/routines/routine-editor-sheet";
import { useBarcode } from "@/src/features/barcode/use-barcode";
import { ProductCard } from "@/src/features/products/product-card";
import { ProductSheet } from "@/src/features/products/product-sheet";
import { AddProductChoiceSheet } from "@/src/features/products/add-product-choice-sheet";
import { ScannerSheet } from "@/src/features/barcode/scanner-sheet";
import { ProductDetailsSheet } from "@/src/features/products/product-details-sheet";
import { CommunitySheet } from "@/src/features/community/community-sheet";
import { InsightNotebookSheet } from "@/src/features/insights/insight-notebook-sheet";
import { useInsights } from "@/src/features/insights/use-insights";
import { useCalendar } from "@/src/features/calendar/use-calendar";
import { CheckInSheet } from "@/src/features/calendar/check-in-sheet";
import { MonthCalendarSheet } from "@/src/features/calendar/month-calendar-sheet";
import { AuthFlow } from "@/src/features/auth/auth-flow";
import { BookHeart, CalendarPlus, Clock3, Grid2X2, Heart, Home, List, PackagePlus, PencilLine, Plus, ScanBarcode, SmilePlus, UserRound } from "lucide-react";
import { ShelfIcon } from "@/src/ui/nav-icons";

type Tab = "Today" | "Shelf" | "Routine" | "You";
type Overlay = "add-choice" | "add" | "scan" | "community" | "notebook" | "checkin" | "calendar" | "auth" | "routine-editor" | null;

export default function ShelfCareApp() {
  const services = useMemo(() => createServiceContainer(), []);
  const productFeature = useProductTracking(services.products);
  const routineFeature = useRoutine(services.routines);
  const barcodeFeature = useBarcode(services.barcode);
  const calendarFeature = useCalendar(services.calendar);
  const insightFeature = useInsights(services.insights, calendarFeature.selectedDate);
  const [activeTab, setActiveTab] = useState<Tab>("Today");
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [prefill, setPrefill] = useState<BarcodeMatch | null>(null);
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("All");
  const [shelfLayout, setShelfLayout] = useState<"grid" | "list">("grid");

  const flash = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2600); };
  const openAdd = () => { setPrefill(null); setOverlay("add-choice"); };
  const addProduct = async (input: NewProduct) => {
    const result = await productFeature.add(input);
    if (!result.ok) { flash(result.error.message); return; }
    setOverlay(null); setPrefill(null); setActiveTab("Shelf"); flash(`${result.value.name} added to your shelf`);
  };
  const lookupBarcode = async (barcode: string) => {
    const match = await barcodeFeature.lookup(barcode);
    if (match) { setPrefill(match); setOverlay("add"); flash("Barcode found — details ready"); }
  };
  const toggleInsight = async () => {
    const result = await insightFeature.toggleDailyFavourite();
    if (!result) return;
    flash(result.ok ? (result.value.favourite ? "Saved to your insight notebook" : "Removed from your notebook") : result.error.message);
  };
  const saveCheckIn = async (input: CalendarCheckIn) => {
    const result = await calendarFeature.saveCheckIn(input);
    if (!result.ok) { flash(result.error.message); return; }
    setOverlay(null);
    flash("Daily check-in saved");
  };
  const toggleProductFavourite = async (product: Product) => {
    const result = await productFeature.setFavourite(product.id, !product.favourite);
    flash(result.ok ? (result.value.favourite ? "Added to favourite products" : "Removed from favourites") : result.error.message);
  };
  const saveRoutine = async (nextSteps: readonly RoutineStep[]) => {
    const result = await routineFeature.replace(nextSteps);
    if (!result.ok) { flash(result.error.message); return; }
    setOverlay(null); flash("Morning routine updated");
  };

  const tabs: Array<{ name: Tab | "Add"; icon: React.ReactNode }> = [
    { name: "Today", icon: <Home className="nav-icon" /> },
    { name: "Shelf", icon: <ShelfIcon className="nav-icon" /> },
    { name: "Add", icon: <Plus className="nav-icon" /> },
    { name: "Routine", icon: <Clock3 className="nav-icon" /> },
    { name: "You", icon: <UserRound className="nav-icon" /> },
  ];
  const { products, shelfScore } = productFeature;
  const { steps, doneCount } = routineFeature;
  const selectedDiaryDay = calendarFeature.selectedDay;
  const selectedDateLabel = new Intl.DateTimeFormat("en-SG", { weekday: "long", day: "numeric", month: "long" }).format(new Date(`${calendarFeature.selectedDate}T12:00:00Z`));
  const diaryDone = selectedDiaryDay?.routineCompleted ?? 0;
  const diaryTotal = selectedDiaryDay?.routineTotal ?? 5;

  const renderToday = () => <>
    <section className="greeting-row"><div><p className="eyebrow date-label">{selectedDateLabel.toUpperCase()}</p><h1>Hello, Nessa <span aria-hidden="true">✦</span></h1></div><button className="avatar" onClick={() => setActiveTab("You")} aria-label="Open profile">N</button></section>
    <section className="quick-actions" aria-label="Quick actions"><button onClick={() => setOverlay("scan")}><span><ScanBarcode aria-hidden="true" /></span><strong>Barcode<br />scan</strong></button><button onClick={() => selectedDiaryDay && setOverlay("checkin")} disabled={!selectedDiaryDay}><span><SmilePlus aria-hidden="true" /></span><strong>Log skin<br />& mood</strong></button><button onClick={openAdd}><span><PackagePlus aria-hidden="true" /></span><strong>Add<br />product</strong></button></section>
    <div className="calendar-label"><span className="card-kicker">YOUR WEEK</span><button onClick={() => setOverlay("calendar")}>View calendar <span>›</span></button></div>
    <section className="week-strip" aria-label="Week calendar">{calendarFeature.days.map((entry) => { const date = new Date(`${entry.date}T12:00:00Z`); return <button key={entry.date} className={`${calendarFeature.selectedDate === entry.date ? "selected" : ""} ${entry.date === "2026-07-31" ? "is-today" : ""}`} onClick={() => calendarFeature.selectDate(entry.date)} aria-label={`View diary for ${new Intl.DateTimeFormat("en-SG", { dateStyle: "full" }).format(date)}`}><span>{new Intl.DateTimeFormat("en-SG", { weekday: "narrow" }).format(date)}</span><strong>{String(date.getUTCDate()).padStart(2, "0")}</strong>{entry.date === "2026-07-31" && <i />}</button>; })}</section>
    {selectedDiaryDay && <section className={`day-snapshot ${selectedDiaryDay.isFuture ? "future" : ""}`} aria-live="polite"><div className="snapshot-heading"><div><span className="card-kicker">{selectedDiaryDay.isFuture ? "PLANNED DAY" : "DAILY CHECK-IN"}</span><h2>{selectedDiaryDay.isFuture ? "Nothing logged yet" : `${selectedDiaryDay.skinStatus} skin · ${selectedDiaryDay.mood}`}</h2></div><span className={`skin-status ${selectedDiaryDay.skinStatus.toLowerCase()}`}>{selectedDiaryDay.isFuture ? "Upcoming" : selectedDiaryDay.skinStatus}</span></div>{selectedDiaryDay.isFuture ? <p>This day is ready for your routine and skin check-in.</p> : <><div className="snapshot-stats"><span><strong>{selectedDiaryDay.routineCompleted}/{selectedDiaryDay.routineTotal}</strong><small>routine steps</small></span><span><strong>{selectedDiaryDay.productsUsed.length}</strong><small>products used</small></span></div><p>{selectedDiaryDay.note}</p><div className="used-products">{selectedDiaryDay.productsUsed.map((product) => <span key={product}>{product}</span>)}</div></>}<button className="checkin-button" onClick={() => setOverlay("checkin")}>{selectedDiaryDay.isFuture ? <CalendarPlus aria-hidden="true" /> : <PencilLine aria-hidden="true" />}<span>{selectedDiaryDay.isFuture ? "Log check-in" : "Update check-in"}</span></button></section>}
    {productFeature.error && <div className="service-error" role="alert"><span>{productFeature.error.message}</span><button onClick={() => void productFeature.refresh()}>Retry</button></div>}
    <section className="health-card"><div className="health-copy"><span className="card-kicker">SHELF HEALTH</span><h2>{productFeature.loading ? "Checking your shelf…" : "Your shelf is looking good."}</h2><p>{products.filter((item) => item.daysLeft < 30).length} products need a little attention this month.</p><button className="text-button" onClick={() => setActiveTab("Shelf")}>See shelf insights <span>→</span></button></div><div className="score" style={{ "--score": `${shelfScore * 3.6}deg` } as React.CSSProperties}><div><strong>{shelfScore}</strong><span>%</span><small>healthy</small></div></div></section>
    <section className="insight-card"><span className="insight-icon">✦</span><div><span className="card-kicker">{calendarFeature.selectedDate === "2026-07-31" ? "TODAY'S INSIGHT" : "DAILY INSIGHT"}</span><p>{insightFeature.daily?.body ?? "Finding this day’s note…"}</p></div><button className={insightFeature.daily?.favourite ? "favourite active" : "favourite"} aria-label={insightFeature.daily?.favourite ? "Remove insight from favourites" : "Save insight to favourites"} aria-pressed={insightFeature.daily?.favourite ?? false} onClick={() => void toggleInsight()} disabled={!insightFeature.daily}><Heart fill={insightFeature.daily?.favourite ? "currentColor" : "none"} aria-hidden="true" /></button></section>
    <section className="section-block"><div className="section-heading"><div><span className="card-kicker">{calendarFeature.selectedDate === "2026-07-31" ? "TODAY'S ROUTINE" : "ROUTINE HISTORY"}</span><h2>Morning glow</h2></div><button onClick={() => setActiveTab("Routine")}>View steps</button></div><button className="routine-summary" onClick={() => setActiveTab("Routine")}><span className="routine-progress" style={{ "--progress": `${(diaryDone / Math.max(diaryTotal, 1)) * 360}deg` } as React.CSSProperties}><b>{diaryDone}/{diaryTotal}</b></span><span><strong>{selectedDiaryDay?.isFuture ? "Ready when you are" : diaryDone === diaryTotal ? "Routine complete" : `${diaryTotal - diaryDone} steps left`}</strong><small>{selectedDiaryDay?.isFuture ? "No activity recorded yet" : selectedDiaryDay?.note ?? "No note for this day"}</small></span><span className="round-arrow">→</span></button></section>
    <section className="section-block expiring-section"><div className="section-heading"><div><span className="card-kicker">KEEP AN EYE ON</span><h2>Expiring soon</h2></div><button onClick={() => setActiveTab("Shelf")}>See all</button></div><div className="product-list">{products.filter((p) => p.daysLeft < 30).slice(0, 2).map((p) => <ProductCard key={p.id} product={p} compact onSelect={setSelectedProduct} />)}</div></section>
  </>;

  const renderShelf = () => {
    const filters = ["All", "Favourites", "Skincare", "Makeup", "Haircare", "Bodycare", "Expiring soon", "Recently added"];
    let visible = [...products];
    if (filter === "Favourites") visible = visible.filter((product) => product.favourite);
    else if (filter === "Expiring soon") visible = visible.filter((product) => product.daysLeft < 30);
    else if (filter === "Recently added") visible.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    else if (filter !== "All") visible = visible.filter((product) => product.category === filter);
    return <><section className="page-header"><div><p className="eyebrow">PRODUCT TRACKING</p><h1>My Shelf</h1><p>{products.length} products · {products.filter((p) => p.daysLeft < 30).length} need attention</p></div><button className="circle-button" onClick={() => setOverlay("scan")} aria-label="Scan a barcode"><ScanBarcode aria-hidden="true" /></button></section>
      <section className="shelf-overview"><div className="mini-score"><strong>{shelfScore}%</strong><span>shelf health</span></div><div><span><i className="dot coral-dot" />{products.filter((p) => p.daysLeft < 30).length} expiring soon</span><span><i className="dot olive-dot" />{products.filter((p) => p.daysLeft >= 30).length} looking good</span></div></section>
      <div className="shelf-tools"><div className="filters">{filters.map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="layout-toggle" aria-label="Inventory layout"><button className={shelfLayout === "grid" ? "active" : ""} onClick={() => setShelfLayout("grid")} aria-label="Grid layout"><Grid2X2 /></button><button className={shelfLayout === "list" ? "active" : ""} onClick={() => setShelfLayout("list")} aria-label="List layout"><List /></button></div></div>
      {productFeature.loading ? <div className="loading-card">Loading your shelf…</div> : visible.length === 0 ? <div className="loading-card">No products match this filter.</div> : <section className={`shelf-products ${shelfLayout}`}>{visible.map((p) => <ProductCard key={p.id} product={p} layout={shelfLayout} onSelect={setSelectedProduct} onToggleFavourite={(product) => void toggleProductFavourite(product)} />)}</section>}
    </>;
  };

  const renderRoutine = () => <><section className="page-header"><div><p className="eyebrow">ROUTINE SERVICE</p><h1>Morning routine</h1><p>A calm start in {steps.length} steps.</p></div><div className="sun-icon">☼</div></section><section className="routine-hero"><div><span>Daily streak</span><strong>8 days</strong><p>Your most consistent week yet.</p></div><button onClick={() => setOverlay("routine-editor")}><PencilLine aria-hidden="true" />Edit routine</button></section>
    {routineFeature.error && <div className="service-error" role="alert"><span>{routineFeature.error.message}</span><button onClick={() => void routineFeature.refresh()}>Retry</button></div>}
    <section className="routine-list">{steps.map((step, index) => <button key={step.id} className={step.complete ? "done" : ""} onClick={() => void routineFeature.toggle(step.id)}><span className="check">{step.complete ? "✓" : index + 1}</span><span><strong>{step.name}</strong><small>{step.instruction}</small></span><span className="step-time">{step.complete ? "Done" : "Start"}</span></button>)}</section>{steps.length > 0 && doneCount === steps.length && <button className="primary-button wide" onClick={() => flash("Morning routine logged")}>Log complete routine</button>}</>;

  const renderProfile = () => <><section className="profile-header"><div className="profile-avatar">N</div><h1>Nessa&apos;s skin diary</h1><p>Combination · sensitive · glow focused</p></section><section className="profile-stats"><div><strong>8</strong><span>day streak</span></div><div><strong>{products.length}</strong><span>products</span></div><div><strong>{shelfScore}%</strong><span>shelf health</span></div></section>
    <button className="notebook-entry" onClick={() => setOverlay("notebook")}><span className="notebook-entry-icon"><BookHeart aria-hidden="true" /></span><span><strong>Saved insights</strong><small>{insightFeature.favourites.length === 0 ? "Your notebook is empty" : `${insightFeature.favourites.length} saved ${insightFeature.favourites.length === 1 ? "note" : "notes"}`}</small></span><span>›</span></button>
    <section className="menu-list"><button onClick={() => setOverlay("auth")}><span>Account & login</span><span>›</span></button><button onClick={() => products[0] && setSelectedProduct(products[0])}><span>Skin profile & ingredients</span><span>›</span></button><button onClick={() => products[0] && setSelectedProduct(products[0])}><span>Reminder preferences</span><span>›</span></button><button onClick={() => flash("Wishlist is ready for your next save")}><span>Wishlist</span><span>›</span></button><button onClick={() => setOverlay("community")}><span>Friends & community</span><span>›</span></button><button onClick={() => flash("Appearance follows your device setting")}><span>Appearance</span><span>›</span></button></section>
    <div className="care-note"><p><strong>A kinder beauty shelf.</strong><br />ShelfCare helps you use what you own and waste a little less.</p></div></>;

  return <main className="app-shell"><div className="brand-rail" aria-hidden="true"><div className="brand-mark"><span className="leaf">◒</span><strong>ShelfCare</strong></div><p>Your makeup and skincare companion.</p><div className="rail-quote">“Know what you own.<br />Use what you love.”</div></div><div className="phone-app"><div className="mobile-content">{activeTab === "Today" && renderToday()}{activeTab === "Shelf" && renderShelf()}{activeTab === "Routine" && renderRoutine()}{activeTab === "You" && renderProfile()}</div>
    <nav className="bottom-nav" aria-label="Primary navigation">{tabs.map((tab) => <button key={tab.name} className={`${activeTab === tab.name ? "active" : ""} ${tab.name === "Add" ? "add-nav" : ""}`} onClick={() => tab.name === "Add" ? openAdd() : setActiveTab(tab.name)}><span aria-hidden="true">{tab.icon}</span><small>{tab.name}</small></button>)}</nav>
    {notice && <div className="toast" role="status">✓ {notice}</div>}
    {overlay === "add-choice" && <AddProductChoiceSheet onClose={() => setOverlay(null)} onScan={() => setOverlay("scan")} onManual={() => setOverlay("add")} />}
    {overlay === "add" && <ProductSheet prefill={prefill} onClose={() => setOverlay(null)} onAdd={addProduct} onScan={() => setOverlay("scan")} />}
    {overlay === "scan" && <ScannerSheet scanning={barcodeFeature.scanning} message={barcodeFeature.message} onClose={() => setOverlay(null)} onLookup={lookupBarcode} />}
    {overlay === "community" && <CommunitySheet service={services.community} onClose={() => setOverlay(null)} />}
    {overlay === "notebook" && <InsightNotebookSheet insights={insightFeature.favourites} onClose={() => setOverlay(null)} onRemove={(id) => void insightFeature.removeFavourite(id)} />}
    {overlay === "checkin" && selectedDiaryDay && <CheckInSheet day={selectedDiaryDay} onClose={() => setOverlay(null)} onSave={saveCheckIn} />}
    {overlay === "calendar" && <MonthCalendarSheet selectedDate={calendarFeature.selectedDate} loggedDates={calendarFeature.loggedDates} onClose={() => setOverlay(null)} onSelect={(date) => { calendarFeature.selectDate(date); setOverlay(null); }} />}
    {overlay === "routine-editor" && <RoutineEditorSheet steps={steps} onClose={() => setOverlay(null)} onSave={saveRoutine} />}
    {overlay === "auth" && <AuthFlow onClose={() => setOverlay(null)} onComplete={(name) => { setOverlay(null); flash(`Welcome to ShelfCare, ${name}`); }} />}
    {selectedProduct && <ProductDetailsSheet product={selectedProduct} ingredients={services.ingredients} reminders={services.reminders} onClose={() => setSelectedProduct(null)} onNotice={flash} />}
  </div></main>;
}
