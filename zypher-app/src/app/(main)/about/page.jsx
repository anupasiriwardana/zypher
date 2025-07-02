export default function AboutPage() {
  return (
    <main className="min-h-screen px-6 py-20 bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-[var(--brand-yellow)]">About Zypher</h1>
        <p className="text-lg leading-relaxed mb-4">
          Zypher was born from a simple frustration: <span className="italic">security tools weren’t built for the way modern engineering teams ship code.</span>
        </p>
        <p className="text-lg leading-relaxed mb-4">
          As developers ourselves, we saw how clunky scanners, false positives, and disjointed workflows created friction—or worse, got ignored. So we built Zypher to <span className="font-semibold">fix security</span>, not add to the noise.
        </p>
        <p className="text-lg leading-relaxed mb-4">
          Today, we help teams bake security into their CI/CD pipelines effortlessly—with <span className="font-semibold">smart detection</span>, <span className="font-semibold">contextual fixes</span>, and <span className="font-semibold">guardrails that actually work</span>.
        </p>
        <p className="text-lg leading-relaxed">
          Because when security <span className="italic">fits your flow</span>, it stops being a chore and starts being a superpower.
        </p>
      </div>
    </main>
  );
}
