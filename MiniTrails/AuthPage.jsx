import { useState } from "react";

export default function AuthPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [mode, setMode] = useState("register");  // or "login"
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (mode === "register") {
      const res = await fetch("http://localhost:3001/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.status === 201) {
        setMessage("🎉 Account created! You can now log in.");
        setForm({ name: "", email: "", password: "" });
      } else {
        const err = await res.text();
        setMessage(`❌ ${err}`);
      }
    }

    // TODO: login logic if you add login API
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">
        {mode === "register" ? "Create Account" : "Log In"}
      </h1>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === "register" && (
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {mode === "register" ? "Create Account" : "Log In"}
        </button>
      </form>

      {message && <p className="text-sm mt-4">{message}</p>}

      <p className="text-sm text-slate-500">
        {mode === "register" ? "Already have an account?" : "Need an account?"}{" "}
        <button
          onClick={() =>
            setMode((m) => (m === "register" ? "login" : "register"))
          }
          className="text-blue-600 underline"
        >
          {mode === "register" ? "Log in" : "Register"}
        </button>
      </p>
    </div>
  );
}
