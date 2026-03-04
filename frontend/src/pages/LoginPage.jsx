import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login attempt:", { email, password });
  };

  return (
    
    <div className="min-h-screen flex items-center justify-center bg-slate-50">

      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border">

        <h1 className="text-2xl font-bold text-center mb-6">
          Sign in to your account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>

            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800"
          >
            Sign In
          </button>
        </form>

        <p className="text-sm text-center mt-6">
          No account?{" "}
          <a href="/register" className="font-semibold hover:underline">
            Register
          </a>
        </p>

      </div>
    </div>
  );
}