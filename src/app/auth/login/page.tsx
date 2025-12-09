"use client";

import { useState } from "react";
import { auth, googleProvider } from "../../../../firebaseConfig";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import  styles from "../../page.module.css"

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // Helper: store ID token
  const storeIdToken = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const idToken = await user.getIdToken();
      // Store in localStorage
      localStorage.setItem("idToken", idToken);
      // Optionally, store in cookie for server API calls
      document.cookie = `token=${idToken}; path=/; secure; samesite=strict`;
    } catch (err) {
      console.error("Failed to get ID token:", err);
    }
  };

  const handleLogin = async () => {
    setMessage("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await storeIdToken();
      router.replace("/dashboard");
    } catch (err: unknown) {
      setMessage("Invalid email or password.");
    }
  };

  const googleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      await storeIdToken();
      router.replace("/dashboard");
    } catch {
      setMessage("Google login failed.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl text-[var( --primary)] text-center font-extrabold mb-6">Login</h1>


        {message && <p className="mt-3 mb-5 text-red-600">{message}</p>}

        <input
          className={styles.input}
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className={styles.input}
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="bg-blue-600 text-white p-2 w-[45%] rounded"
          onClick={handleLogin}
        >
          Login
        </button>

        <button
          className="bg-red-500 text-white p-2 w-[45%] rounded mt-3 ml-10"
          onClick={googleLogin}
        >
          Login with Google
        </button>

        <div className="mt-6 text-center">
          <a href="/auth/signup" className="text-( --primary)">
            Don&apos;t have an account? <span className="text-blue-500 font-bold">Sign up</span>
          </a>
        </div>
      </div>
    </main>
  );
}
