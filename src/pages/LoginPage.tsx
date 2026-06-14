import { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function LoginPage() {
  const { login, signup } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    console.log("LOGIN CLICKED"); // 👈 debug
    setLoading(true);

    const { error } = await login(email, password);

    setLoading(false);

    if (error) {
      console.log(error);
      alert(error.message);
    } else {
      alert("Login success ✅");
    }
  };

  const handleSignup = async () => {
    console.log("SIGNUP CLICKED"); // 👈 debug
    setLoading(true);

    const { error } = await signup(email, password);

    setLoading(false);

    if (error) {
      console.log(error);
      alert(error.message);
    } else {
      alert("Account created ✅");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleLogin} disabled={loading}>
        Login
      </button>

      <button onClick={handleSignup} disabled={loading}>
        Sign Up
      </button>
    </div>
  );
}