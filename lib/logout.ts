import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred during logout.";
    return { success: false, error: message };
  }
};
