import "./page.css";

export default function Home() {
  return (
    <main className="container">
      {/* LEFT SIDE */}
      <section className="left">
        <h1 className="logo">
          <span className="yellow">LSUS</span> <span className="white">CONNECT</span>
        </h1>

        <p className="tagline">Where Students Connect, Trade, and Thrive.</p>
      </section>

      {/* RIGHT SIDE CARD */}
      <section className="right">
        <div className="card">
          <h2 className="title">Welcome Back Pilots Home</h2>

          <p className="subtitle">Sign in to continue to LSUS Connect</p>

          <input type="email" placeholder="Email Address" className="input" />
          <input type="password" placeholder="Password" className="input" />

          <a href="#" className="forgot">Forgot Password???</a>

          <button className="btn">Sign In</button>

          <p className="signup">
            Don't have an account? <a href="#">Sign Up</a>
          </p>
        </div>
      </section>
    </main>
  );
}
