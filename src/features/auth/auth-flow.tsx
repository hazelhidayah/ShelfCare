"use client";

import { Bell, ChevronLeft, PackagePlus, ScanBarcode, Sparkles, X } from "lucide-react";
import { FormEvent, useState } from "react";

export type AccountMode = "local" | "synced";

const onboarding = [
  { icon: ScanBarcode, title: "Scan beauty products instantly", body: "Know what is on your shelf without typing every detail." },
  { icon: PackagePlus, title: "Build your beauty shelf", body: "Log products, track expiry dates and keep routines organised." },
  { icon: Sparkles, title: "Connect your skin to your mood", body: "See how routine, mood and skin condition change together." },
];

export function AuthFlow({ onClose, onComplete, initialStep = 0 }: { onClose: () => void; onComplete: (name: string, mode: AccountMode) => void; initialStep?: number }) {
  const [step, setStep] = useState(initialStep);
  const [loginOpen, setLoginOpen] = useState(false);
  const [accountMode, setAccountMode] = useState<AccountMode>("synced");
  const [name, setName] = useState("Nessa");
  const [choices, setChoices] = useState<Record<string, string[]>>({});
  const chooseOne = (key: string, value: string) => setChoices((current) => ({ ...current, [key]: [value] }));
  const toggle = (key: string, value: string) => setChoices((current) => ({ ...current, [key]: current[key]?.includes(value) ? current[key].filter((item) => item !== value) : [...(current[key] ?? []), value] }));
  const next = () => setStep((current) => Math.min(8, current + 1));
  const submitAccount = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setAccountMode("synced"); next(); };
  const continueLocally = () => { setAccountMode("local"); next(); };
  const submitLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.localStorage.setItem("shelflife.account-mode", "synced");
    onComplete("Nessa", "synced");
  };
  const finish = () => {
    window.localStorage.setItem("shelflife.profile", JSON.stringify({ name, choices }));
    window.localStorage.setItem("shelflife.account-mode", accountMode);
    onComplete(name, accountMode);
  };

  const question = (title: string, key: string, options: string[], multi = false) => <div className="auth-question"><span className="auth-step">STEP {step - 3} / 4</span><h2>{title}</h2><div className="auth-options">{options.map((option) => <button key={option} className={choices[key]?.includes(option) ? "selected" : ""} onClick={() => multi ? toggle(key, option) : chooseOne(key, option)}>{option}<i /></button>)}</div><button className="auth-primary" onClick={next}>Next</button></div>;

  return <div className="auth-flow" role="dialog" aria-modal="true" aria-label="ShelfCare account setup">
    <header><button onClick={() => loginOpen ? setLoginOpen(false) : step ? setStep(step - 1) : onClose()} aria-label={loginOpen || step ? "Back" : "Close"}>{loginOpen || step ? <ChevronLeft /> : <X />}</button><strong>ShelfCare</strong><span /></header>
    {loginOpen ? <form className="signup-form login-form" onSubmit={submitLogin}><span className="card-kicker">WELCOME BACK</span><h1>Sign in to ShelfCare</h1><p>Access your shelf, routines, and saved skin diary.</p><label>Email<input required type="email" placeholder="you@example.com" autoComplete="email" /></label><label>Password<input required type="password" placeholder="Your password" autoComplete="current-password" /></label><button className="forgot-password" type="button">Forgot password?</button><button className="auth-primary">Sign in</button><button className="auth-secondary" type="button" onClick={() => setLoginOpen(false)}>Create a new account</button></form> : <>
      {step < 3 && (() => { const item = onboarding[step]; const Icon = item.icon; return <section className="onboarding-slide"><div className="onboarding-illustration"><Icon aria-hidden="true" /></div><h1>{item.title}</h1><p>{item.body}</p><div className="auth-dots">{onboarding.map((_, index) => <i key={index} className={index === step ? "active" : ""} />)}</div><button className="auth-primary" onClick={next}>{step === 2 ? "Let’s get started" : "Next"}</button></section>; })()}
      {step === 3 && <form className="signup-form" onSubmit={submitAccount}><span className="card-kicker">CHOOSE HOW TO SAVE</span><h1>Create your ShelfCare</h1><p className="signup-explainer">Create an account to securely sync your shelf, routines, and check-ins online and use them on any device.</p><label>Name<input required value={name} onChange={(event) => setName(event.target.value)} /></label><label>Email<input required type="email" placeholder="you@example.com" autoComplete="email" /></label><label>Password<input required type="password" minLength={8} placeholder="At least 8 characters" autoComplete="new-password" /></label><label className="terms"><input required type="checkbox" />I agree to the Terms & Conditions.</label><button className="auth-primary">Create account & sync</button><div className="local-choice"><strong>Prefer to keep things on this device?</strong><span>You can use every core feature without an account. Your data will stay in this browser and can be exported from Account settings.</span><button type="button" onClick={continueLocally}>Continue locally</button></div><button className="auth-secondary" type="button" onClick={() => setLoginOpen(true)}>I already have an account</button></form>}
      {step === 4 && question("I identify as…", "identity", ["Female", "Male", "Prefer not to say"])}
      {step === 5 && question("What’s your skin type?", "skin", ["Oily", "Dry", "Combination", "Sensitive", "Not sure"])}
      {step === 6 && question("What are your skincare goals?", "goals", ["Reduce acne", "Improve hydration", "Brighten complexion", "Anti-ageing"], true)}
      {step === 7 && question("What products do you use regularly?", "products", ["Makeup", "Skincare", "Bodycare", "Haircare"], true)}
      {step === 8 && <section className="notify-step"><div className="onboarding-illustration"><Bell aria-hidden="true" /></div><h1>Get notified</h1><p>Receive expiry reminders and gentle routine nudges when they matter.</p><button className="auth-primary" onClick={finish}>Enable notifications</button><button className="auth-secondary" onClick={finish}>Maybe later</button></section>}
    </>}
  </div>;
}
