"use client";

import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "@/app/lib/config/firebase";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";

const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken(); 

    await axios.get(`${process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL}/auth/admin/me`, {
        headers:{
            Authorization: `Bearer ${idToken}`
        }
    });


  } catch (error) {
    
    if (isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        await signOut(auth);
        toast.error("Access denied", {
          description: "You don't have permission to sign in"
        });
      } else {
        toast.error("Sign in failed", {
          description: error.response?.data ?? error.message
        });
      }
    } else {
      toast.error("Sign in failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    }
    
    // Re-throw error so the caller can handle loading state
    throw error;
  }
}