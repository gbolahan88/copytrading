"use client";

import { useState } from "react";
import { auth, googleProvider } from "../../../../firebaseConfig";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import styles from "../../page.module.css"

export default function Signup() {
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
      // Optionally store in cookie for backend
      document.cookie = `token=${idToken}; path=/; secure; samesite=strict`;
    } catch (err) {
      console.error("Failed to get ID token:", err);
    }
  };

  const handleSignup = async () => {
    setMessage("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await storeIdToken(); // store token after signup
      router.push("/dashboard");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Signup failed.");
    }
  };

  const googleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      await storeIdToken(); // store token after Google signup
      router.replace("/dashboard");
    } catch (err) {
      setMessage("Google login failed.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl text-[var( --primary)] text-center font-extrabold mb-6">Create Account</h1>

        {message && <p className="mt-3 text-red-500">{message}</p>}

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

        <button className="bg-blue-600 text-white p-2 w-[45%] rounded" onClick={handleSignup}>
          Sign Up
        </button>

        <button
          className="bg-red-500 text-white p-2 w-[45%] rounded mt-3 ml-10"
          onClick={googleSignup}
        >
          Sign up with Google
        </button>

        <div className="mt-6 text-center">
          <a href="/auth/login" className="text-( --primary) ">
            Already have an account? <span className="text-blue-500 font-bold">Login</span>
          </a>
        </div>
      </div>
    </main>
  );
}
