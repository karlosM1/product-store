import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ setUser }: { setUser: (user: any) => void }) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form,
      );
      setUser(res.data);
      navigate("/");
    } catch (err) {
      setError(
        "Failed to login" +
          (err instanceof Error ? err.message : "Unknown error"),
      );
    }
  };

  return (
    <div className="min-h-screem flex items-center justify-center">
      <form className="bg-white p-6 rounded shadow-md" onSubmit={handleSubmit}>
        <h2>Log in</h2>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="email"
          placeholder="email"
          className="border p-2 w-full mb-3"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-3"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="w-full bg-blue-500 p-5" type="submit">
          Log in
        </button>
      </form>
    </div>
  );
};

export default Login;
