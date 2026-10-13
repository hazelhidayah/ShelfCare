"use client";

import { Bell, ChevronLeft, PackagePlus, ScanBarcode, Sparkles, X } from "lucide-react";
import { FormEvent, useState } from "react";

const onboarding = [
  { icon: ScanBarcode, title: "Scan beauty products instantly", body: "Know what is on your shelf without typing every detail." },
  { icon: PackagePlus, title: "Build your beauty shelf", body: "Log products, track expiry dates and keep routines organised." },
  { icon: Sparkles, title: "Connect your skin to your mood", body: "See how routine, mood and skin condition change together." },
];

export function AuthFlow({ onClose, onComplete }: { onClose: () => void; onComplete: (name: string) => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("Nessa");
  const [choices, setChoices] = useState<Record<string, string[]>>({});
  const chooseOne = (key: string, value: string) => setChoices((current) => ({ ...current, [key]: [value] }));
  const toggle = (key: string, value: string) => setChoices((current) => ({ ...current, [key]: current[key]?.includes(value) ? current[key].filter((item) => item !== value) : [...(current[key] ?? []), value] }));
  const next = () => setStep((current) => Math.min(8, current + 1));
  const submitAccount = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); next(); };
  const finish = () => { window.localStorage.setItem("shelflife.profile", JSON.stringify({ name, choices })); onComplete(name); };

  const question = (title: string, key: string, options: string[], multi = false) => <div className="auth-question"><span className="auth-step">STEP {step - 3} / 4</span><h2>{title}</h2><div className="auth-options">{options.map((option) => <button key={option} className={choices[key]?.includes(option) ? "selected" : ""} onClick={() => multi ? toggle(key, option) : chooseOne(key, option)}>{option}<i /></button>)}</div><button className="auth-primary" onClick={next}>Next</button></div>;

  return <div className="auth-flow" role="dialog" aria-modal="true" aria-label="ShelfCare account setup">
    <header><button onClick={() => step ? setStep(step - 1) : onClose()} aria-label={step ? "Back" : "Close"}>{step ? <ChevronLeft /> : <X />}</button><strong>ShelfCare</strong><span /></header>
    {step < 3 && (() => { const item = onboarding[step]; const Icon = item.icon; return <section className="onboarding-slide"><div className="onboarding-illustration"><Icon aria-hidden="true" /></div><h1>{item.title}</h1><p>{item.body}</p><div className="auth-dots">{onboarding.map((_, index) => <i key={index} className={index === step ? "active" : ""} />)}</div><button className="auth-primary" onClick={next}>{step === 2 ? "Let’s get started" : "Next"}</button></section>; })()}
    {step === 3 && <form className="signup-form" onSubmit={submitAccount}><span className="card-kicker">CREATE YOUR ACCOUNT</span><h1>Sign up for free</h1><label>Name<input required value={name} onChange={(event) => setName(event.target.value)} /></label><label>Email<input required type="email" placeholder="you@example.com" /></label><label>Password<input required type="password" minLength={8} placeholder="At least 8 characters" /></label><label className="terms"><input required type="checkbox" />I agree to the Terms & Conditions.</label><button className="auth-primary">Get started</button><button className="auth-secondary" type="button" onClick={next}>I already have an account</button></form>}
    {step === 4 && question("I identify as…", "identity", ["Female", "Male", "Prefer not to say"])}
    {step === 5 && question("What’s your skin type?", "skin", ["Oily", "Dry", "Combination", "Sensitive", "Not sure"])}
    {step === 6 && question("What are your skincare goals?", "goals", ["Reduce acne", "Improve hydration", "Brighten complexion", "Anti-ageing"], true)}
    {step === 7 && question("What products do you use regularly?", "products", ["Makeup", "Skincare", "Bodycare", "Haircare"], true)}
    {step === 8 && <section className="notify-step"><div className="onboarding-illustration"><Bell aria-hidden="true" /></div><h1>Get notified</h1><p>Receive expiry reminders and gentle routine nudges when they matter.</p><button className="auth-primary" onClick={finish}>Enable notifications</button><button className="auth-secondary" onClick={finish}>Maybe later</button></section>}
  </div>;
}
