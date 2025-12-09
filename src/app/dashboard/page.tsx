"use client";

import { useEffect, useState } from "react";
import { auth } from "../../../firebaseConfig";
import { useRouter } from "next/navigation";
import { logoutUser } from "../../../lib/logout";
import styles from "../page.module.css"

type MasterToken = {
  id: string;
  label: string;
  token: string;
  email: string;
  accountType: string;
  isActive: boolean;
  accountId?: string;
  balance?: number;
  currency?: string;
  profit: number;
  loss: number;
  equity: number;
};

type CopierToken = {
  id: string;
  token: string;
  accountId: string;
  email: string;
  masterId: string;
  masterLabel: string;
  riskMultiplier: number;
  accountType: string;
  stakeType: string;
  stakeAmount: number;
  isActive: boolean;
};

export default function Dashboard() {
  const router = useRouter();
  const [masterTokens, setMasterTokens] = useState<MasterToken[]>([]);
  const [copierTokens, setCopierTokens] = useState<CopierToken[]>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [tokenValue, setTokenValue] = useState("");
  const [copierValue, setCopierValue] = useState("");
  const [selectedMaster, setSelectedMaster] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [masterMessage, setMasterMessage] = useState("");
  const [copierMessage, setCopierMessage] = useState("");

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }

      setEmail(user.email);

      const idToken = await user.getIdToken();
      await fetchTokens(idToken);
      await fetchCopiers(idToken);
    });
    return () => unsub();
  }, []);

  
  async function getIdToken() {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
  }

  async function fetchTokens(idTok?: string | null) {
    setLoading(true);
    setMessage("");

    try {
      const idToken = idTok ?? await getIdToken();
      const res = await fetch("/api/tokens/master", { headers: { Authorization: `Bearer ${idToken}` }});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMasterTokens(data);
    } catch (err: unknown) {
      let message = "Failed to load master token";
      if (typeof err === "string") message = err;
      else if (err instanceof Error) message = err.message;
      setMessage(message || "Failed to load master tokens");
    } finally { setLoading(false); }
  }

  async function fetchCopiers(idTok?: string | null) {
    setLoading(true);
    setMessage("");
    try {
      const idToken = idTok ?? await getIdToken();
      const res = await fetch("/api/tokens/copier", { headers: { Authorization: `Bearer ${idToken}` }});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setCopierTokens(data);
    } catch (err: unknown) {
      let message = "Failed to load copier";
      if (typeof err === "string") message = err;
      else if (err instanceof Error) message = err.message;
      setMessage(message || "Failed to load copiers");
    } finally { setLoading(false); }
  }

  async function createMaster() {
    setLoading(true); 
    setMasterMessage("");
    try {
      const idToken = await getIdToken();
      const res = await fetch("/api/tokens/master", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ token: tokenValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add");
      // append server returned token
      setMasterTokens(prev => [data, ...prev]);
      setTokenValue("");
      setMasterMessage(`Master token validated successfully! Account ID: ${data.accountId || data.accountData?.accountId}`);
    } catch (err: unknown) { 
      let message = "Failed to validate master token";
      if (typeof err === "string") message = err;
      else if (err instanceof Error) message = err.message;
      setMasterMessage(message || "Failed to validate master token"); }
    finally { setLoading(false); }
  }

  async function registerCopier() {
    if (!selectedMaster || !copierValue) return alert("Select master and token");
    setLoading(true); 
    setCopierMessage("");
    try {
      const idToken = await getIdToken();
      const res = await fetch("/api/tokens/copier", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ copierToken: copierValue, masterId: selectedMaster }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setCopierTokens(prev => [data.copier, ...prev]);
      setCopierValue("");
      setSelectedMaster("");
      setCopierMessage("Copier Token registered successfully");
    } catch (err: unknown) { 
      let message = "Failed to register token";
      if (typeof err === "string") message = err;
      else if (err instanceof Error) message = err.message;
      setCopierMessage(message || "Failed to register Copier token"); }
    finally { setLoading(false); }
  }

  async function toggleCopier(id: string, active: boolean) {
    const idToken = await getIdToken();
    await fetch("/api/tokens/copier", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ id, isActive: active }),
    });
    fetchCopiers();
  }

  async function deleteMaster(id: string) {
    const idToken = await getIdToken();
    await fetch(`/api/tokens/master?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${idToken}` }});
    fetchTokens();
  }

  async function deleteCopier(id: string) {
    const idToken = await getIdToken();
    await fetch(`/api/tokens/copier?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${idToken}` }});
    fetchCopiers();
  }

  // LOGOUT
  const handleLogout = async () => {
    const res = await logoutUser();
    if (res.success) router.push("/auth/login");
    else alert("Logout failed: " + res.error);
  };

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="w-full flex justify-between items-center px-6 py-4 top-0 bg-white shadow mt-15 mb-10">
        <p className="text-( ---primary)">Logged in as: <span className="text-green-500 font-semibold">{email}</span></p>

        <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-2 py-2 rounded-lg"
          >
            Logout
        </button>
      </div>

      <div className=" w-full flex flex-col items-center">
        <h1 className="text-4xl font-bold text-(--primary)">Dashboard</h1>
        

        <h2 className="mt-5 text-2xl text-(--primary)">Don&apos;t have a binary account? register below</h2>
        <a href="https://deriv.be/" target="blank"><button className={styles.regBtn}>Register New Account!</button></a>
      </div>

      <section className={styles.section}>
        <h2 className="text-2xl text-(--primary)">Add Master Token</h2>
        <p className="w-full mt-10 text-( --primary)">Here you can link multiple accounts into one master account. Every trade on the master account will be copied to the other accounts. 
          Insert the token from the master account below, then insert the tokens from the accounts you want to copy the master. Only Call/Put, 
          CallEquals/Put Equals, Higher/Lower, Match/Differ, Over/Under, Touch/No Touch, Even/Odd, Ends Between/Ends Outside, and Stays Between/Goes Outside trade types will be copied.
          Since all the copy trading flow happens on the server, neither the client nor the master need to run any application or have any page opened for the copy to occur. When a master account has no copiers, 
          it will be removed from the system daily at 00:00 GMT. After registering new tokens, please wait 5-7 minutes before the copy starts. That is a copy trading software. For the copy trader to work, you must have at least two accounts registered, 
          one master and one copier. In case you are not a master trader and are trying to find someone to copy, please go to <span className="text-green-400">Auto Trader Web</span>
        </p>

        <input 
          value={tokenValue} 
          onChange={e => setTokenValue(e.target.value)} 
          placeholder="Master token" 
          className="mt-10 border-b-2 p-2 text-(--primary) mr-2"
        />

        <button 
          className="bg-amber-600 px-4 py-2 rounded text-white mt-10"
          onClick={createMaster} 
          disabled={loading}>
            {loading ? "Processing..." : "Validate Token"}
        </button>

        {masterMessage && (
          <p
            className={`mt-2 ${
              masterMessage.toLowerCase().includes("master") ? "text-green-500" : "text-red-500"
            }`}
          >
            {masterMessage}
          </p>
        )}
      </section>

      
      <section className={styles.section}>
        <h2 className="text-2xl text-(--primary)">Master Tokens</h2>
        {masterTokens.length === 0 && <p className="mt-10">No tokens registered.</p>}
        {masterTokens.map(m => (
          <div key={m.id} className="flex gap-5 p-2 border my-2">
            <div>{m.label} | {m.accountId} | {m.email || "No Email"} | Balance: {m.balance} {m.currency} | Equity: {m.equity} | Profit/Loss: {m.profit || m.loss}{m.currency}</div>
            <button 
              className="px-2 py-1 rounded bg-red-600 text-white" 
              onClick={() => deleteMaster(m.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h2 className="text-2xl text-(--primary)">Register Copier</h2>
        <select
          className="mt-10 border p-2 mb-2 w-full" 
          value={selectedMaster} 
          onChange={e => setSelectedMaster(e.target.value)}
        >
          <option className="text-black" value="">Select master</option>
          {masterTokens.map(m => <option className="text-black" key={m.id} value={m.id}>{m.label} ({m.accountId})</option>)}
        </select>
        <input 
          className="border p-2 mb-2 w-full"
          value={copierValue} 
          onChange={e => setCopierValue(e.target.value)} 
          placeholder="Copier token" 
        />
        <button 
          className="mt-3 bg-blue-500 text-white p-2 rounded w-full"
          onClick={registerCopier} 
          disabled={loading}>{loading ? "Processing..." : "Register Corpier"}
        </button>

        
          <p
            className={`mt-2 ${
              copierMessage.toLowerCase().includes("copier") ? "text-green-500" : "text-red-500"
            }`}
          >
            {copierMessage}
          </p>
          
      </section>

      <section className={styles.section}>
        <h2 className="text-2xl text-(--primary)">Copiers</h2>
        {copierTokens.length === 0 && <p className="mt-10 mb-20 text-center">No copier tokens registered.</p>}
        {copierTokens.map(c => (
          <div key={c.id} className="text-( --primary) flex flex-col md:flex-row justify-between items-center p-4 border rounded w-full max-w-xl shadow gap-5">
            <div>{c.email} | {c.accountId} | {c.isActive}</div>
            <button className={`px-4 py-2 rounded text-white ${c.isActive ? "bg-green-600" : "bg-gray-600"}`} onClick={() => toggleCopier(c.id, !c.isActive)}>{c.isActive ? "Stop" : "Start"}</button>
            <button className="px-4 py-2 rounded bg-red-600 text-white" onClick={() => deleteCopier(c.id)}>Delete</button>
          </div>
        ))}
      </section>

      {message && <p className="mt-4">{message}</p>}
    </main>
  );
}




/*"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../../firebaseConfig";
import { logoutUser } from "../../../lib/logout";
import styles from "../page.module.css"

type MasterToken = {
  id: string;
  label: string;
  token: string;
  accountType: string;
  isActive: boolean;
  accountId?: string;
  balance?: number;
  currency?: string;
};

type CopierToken = {
  id: string;
  CopierToken: string;
  accountId: string;
  masterId: string;
  masterLabel: string;
  riskMultiplier: number;
  accountType: string;
  stakeType: "FOLLOW MASTER" | "FIXED";
  stakeAmount: number; 
  isActive: boolean;
};

export default function Dashboard() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [masterTokens, setMasterTokens] = useState<MasterToken[]>([]);
  const [copierTokens, setCopierTokens] = useState<CopierToken[]>([]);
  const [copierToken, setCopierToken] = useState("")
  const [selectMaster, setSelectMaster] = useState("")
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [stakeType, setStakeType] = useState<"FOLLOW MASTER" | "FIXED">("FOLLOW MASTER");
  const [stakeAmount, setStakeAmount] = useState<number>(10)

  // Redirect if user not logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/auth/login");
        return;
      } else {
        fetchTokens(user.getIdToken());
        fetchCopiers(user.getIdToken());
      }
    });

    return () => unsubscribe();
  }, []);




  // Helper: get Firebase ID token
  const getIdToken = async (): Promise<string | null> => {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  };

  // FETCH master tokens (GET)
  const fetchTokens = async (tokenPromise?: Promise<string>) => {
    setLoading(true);
    setMessage("");

    try {
      const idToken = tokenPromise ? await tokenPromise : await getIdToken();
      if (!idToken) throw new Error("Not authenticated");

      const res = await fetch("/api/tokens/master", {
        method: "GET",
        headers: { Authorization: `Bearer ${idToken}` },
      });

      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Failed to fetch tokens");
      else setMasterTokens(data);
    } catch (err: unknown) {
      let message = "Failed to fetch tokens";
      if (typeof err === "string") message = err;
      else if (err instanceof Error) message = err.message;
      setMessage(message || "Failed to fetch tokens");
    } finally {
      setLoading(false);
    }
  };

  const fetchCopiers = async (tokenPromise?: Promise<string>) => {
    setLoading(true);
    setMessage("");
    try {
      const idToken = tokenPromise ? await tokenPromise : await getIdToken();
      if (!idToken) throw new Error("Not authenticated");

      const res = await fetch("/api/tokens/copier", {
        method: "GET",
        headers: { Authorization: `Bearer ${idToken}` },
      });

      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Failed to fetch copier tokens");
      else setCopierTokens(data);
    } catch (err: unknown) {
      let msg = "Failed to fetch copier tokens";
      if (err instanceof Error) msg = err.message;
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const handleLogout = async () => {
    const res = await logoutUser();
    if (res.success) router.push("/auth/login");
    else alert("Logout failed: " + res.error);
  };

  // CREATE / VALIDATE master token (POST)
  const createToken = async () => {
    setLoading(true);
    setMessage("");

    try {
      const idToken = await getIdToken();
      if (!idToken) throw new Error("Not authenticated");

      const res = await fetch("/api/tokens/master", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Failed to validate token");
      else {

        // Update state instantly
        const newMaster: MasterToken = {
          id: data.id || data.accountData?.id,
          label: `Master ${data.accountId || "Token"}`,
          token: token,
          accountType: data.accountType || "REAL",
          isActive: true,
          accountId: data.accountId,
          balance: data.balance,
          currency: data.currency,
        };
        setMasterTokens((prev) => [data, ...prev]);

        setMessage(
          `Token validated! Account ID: ${data.accountId || data.accountData?.accountId}`
        );
        setToken("");
        fetchTokens(Promise.resolve(idToken));
      }
    } catch (err: unknown) {
      let message = "Failed to validate token";
      if (typeof err === "string") message = err;
      else if (err instanceof Error) message = err.message;
      setMessage(message || "Failed to validate token");
    } finally {
      setLoading(false);
    }
  };

   // Register copier token
  const registerCopier = async () => {
    if (!selectMaster || !copierToken) return alert("Select master and enter copier token");
    setLoading(true);
    setMessage("");

    try {
      const idToken = await getIdToken();
      if (!idToken) throw new Error("Not authenticated");

      const res = await fetch("/api/tokens/copier", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ copierToken, masterId: selectMaster, stakeType, stakeAmount }),
      });

      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Failed to register copier");
      else {
        setMessage("Copier token registered successfully!");
        setCopierToken("");
        setSelectMaster("");
        fetchCopiers();
      }
    } catch (err: unknown) {
      let msg = "Failed to register copier";
      if (err instanceof Error) msg = err.message;
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // TOGGLE COPY TRADING
  const toggleCopyTrading = async (id: string, active: boolean) => {
    try {
      const idToken = await getIdToken();
      const res = await fetch("/api/tokens/copier", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ id, isActive: active }),
      });
      const data = await res.json();
      if (res.ok) fetchCopiers(); // refresh list
      else console.error(data.error);
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE COPIER TOKEN
  const deleteCopier = async (id: string) => {
    const idToken = await getIdToken();
    await fetch(`/api/tokens/copier?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${idToken}` },
    });
    fetchCopiers();
  };


  // UPDATE token (PATCH)
  const updateToken = async (id: string, updates: Partial<MasterToken>) => {
    setLoading(true);
    setMessage("");

    try {
      const idToken = await getIdToken();
      if (!idToken) throw new Error("Not authenticated");

      const res = await fetch("/api/tokens/master", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ id, ...updates }),
      });

      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Failed to update token");
      else {
        setMessage("Token updated successfully");
        fetchTokens(Promise.resolve(idToken));
      }
    } catch (err: unknown) {
      let message = "Failed to update token";
      if (typeof err === "string") message = err;
      else if (err instanceof Error) message = err.message;
      setMessage(message || "Failed to update token");
    } finally {
      setLoading(false);
    }
  };

  // DELETE token (DELETE)
  const deleteToken = async (id: string) => {
    setLoading(true);
    setMessage("");

    try {
      const idToken = await getIdToken();
      if (!idToken) throw new Error("Not authenticated");

      const res = await fetch(`/api/tokens/master?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` },
      });

      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Failed to delete token");
      else {
        setMessage("Token deleted successfully");
        fetchTokens(Promise.resolve(idToken));
      }
    } catch (err: unknown) {
      let message = "Failed to delete token";
      if (typeof err === "string") message = err;
      else if (err instanceof Error) message = err.message;
      setMessage(message || "Failed to delete token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center ">
      <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg ml-[80%] mt-20"
        >
          Logout
      </button>
    
      <h1 className="text-4xl font-bold text-[var(--primary)]">Don&apos;t have a binary account? register below</h1>
        
      <a href=""><button className="mt-10 mb-15 bg-blue-600 text-white px-4 py-2 rounded-lg items-center">Register New Account!</button></a>

      <hr></hr>

      {/* Master token section 
      <section className={styles.section}>
        <h2 className="text-2xl font-bold text-[var(--primary)]">Add Master Token</h2>
        <input
          type="text"
          placeholder="Master Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="border-b-2 p-2 text-[var(--primary)] mr-2"
        />
        <button
          onClick={createToken}
          className="bg-amber-600 px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Processing..." : "Validate Token"}
        </button>
        {message && (
          <p
            className={`mt-2 ${
              message.toLowerCase().includes("success") ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </section>

      {/* List of Master token section 
      <section className={styles.section}>
        <h2 className="text-2xl font-bold text-[var(--primary)]">Master Tokens</h2>
        {masterTokens.length === 0 && <p>No tokens registered.</p>}
        <ul className="mt-5 space-y-2">
          {masterTokens.map((t) => (
            <li
              key={t.id}
              className="flex justify-between items-center p-2 border rounded"
            >
              <div>
                <span className="font-bold">{t.label}</span> ({t.accountType}) -{" "}
                {t.accountId || "N/A"} - {t.balance || 0} {t.currency || ""}
              </div>
              <div className="p-5 flex gap-2">
                <button
                  className={`px-2 py-1 rounded text-white ${
                    t.isActive ? "bg-blue-600" : "bg-gray-600"
                  }`}
                  onClick={() => updateToken(t.id, { isActive: !t.isActive })}
                >
                  {t.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  className="px-2 py-1 rounded bg-red-600 text-white"
                  onClick={() => deleteToken(t.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>


      {/* Copier token Section *
      {masterTokens.length > 0 && (
        <section className={styles.section}>
          <div className="p-4 border rounded-md max-w-md">
            <h2 className="text-lg font-bold mb-2">Register Copier Token</h2>

            <select
              className="border p-2 mb-2 w-full"
              value={selectMaster}
              onChange={(e) => setSelectMaster(e.target.value)}
            >
              <option value="">Select Master</option>
              {masterTokens.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} ({m.accountId})
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Copier Token"
              value={copierToken}
              onChange={(e) => setCopierToken(e.target.value)}
              className="border p-2 mb-2 w-full"
            />

            <div className="flex gap-2">
              <select
                className="border p-2 flex-1"
                value={stakeType}
                onChange={(e) => setStakeType(e.target.value as "FOLLOW MASTER" | "FIXED")}
              >
                <option value="FOLLOW MASTER">Follow Master</option>
                <option value="FIXED">Fixed Amount</option>
              </select>

              <input
                type="number"
                placeholder="Stake Amount"
                className="border p-2 flex-1"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(Number(e.target.value))}
              />
            </div>

            <button 
              onClick={registerCopier} 
              className="mt-3 bg-blue-500 text-white p-2 rounded w-full"
              disabled={loading}
            >
              {loading ? "Processing..." : "Register Corpier"}
            </button>
          </div>

          {/* lIST OF COPIER TOKEN *

          <h2 className="mt-15 text-2xl font-bold text-[var(--primary)] mb-4 text-center">Copier Tokens</h2>
          {copierToken.length === 0 && <p className="text-center">No copier tokens registered.</p>}

          <ul className="space-y-4 flex flex-col items-center">
            {copierTokens.map((c) => (
              <li key={c.id} className="flex flex-col md:flex-row justify-between items-center p-4 border rounded w-full max-w-xl bg-white shadow">
                <div className="flex flex-col gap-1">
                  <span className="font-bold">Master: {c.masterLabel}</span>
                  <span>Risk: {c.riskMultiplier}</span>
                  <span>Stake Type: {c.stakeType}</span>
                  <span>Stake Amount: {c.stakeAmount}{c.stakeType === "FOLLOW MASTER" ? "%" : ""}</span>
                </div>

                <div className="flex gap-2 mt-2 md:mt-0">
                  <button
                    className={`px-4 py-2 rounded text-white ${c.isActive ? "bg-green-600" : "bg-gray-600"}`}
                    onClick={() => toggleCopyTrading(c.id, !c.isActive)}
                  >
                    {c.isActive ? "Stop Copying" : "Start Copying"}
                  </button>

                  <button
                    className="px-4 py-2 rounded bg-red-600 text-white"
                    onClick={() => deleteCopier(c.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}*/
