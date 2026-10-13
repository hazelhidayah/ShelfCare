"use client";

export default function ErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="app-shell"><section className="phone-app"><div className="mobile-content error-screen"><span className="card-kicker">SHELFLIFE RECOVERY</span><h1>Something needs a moment.</h1><p>Your saved shelf is safe. Try loading this screen again.</p><button className="primary-button" onClick={reset}>Try again</button></div></section></main>;
}
