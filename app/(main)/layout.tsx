"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/app/lib/config/firebase";
import DashboardLayoutClient from "./_components/DashboardLayoutClient";
import { toast } from "sonner";
import { api } from "@/app/lib/config/api";
import { isAxiosError } from "axios";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // No user signed in, redirect to landing page
        router.replace('/');
        setLoading(false);
      } else {
        // Verify with your backend
        try {
          await api.get("/auth/admin/me");
          setIsAuthenticated(true);
        } catch (error) {
          if (isAxiosError(error)) {
            const status = error.response?.status;
            if (status === 401 || status === 403) {
              await signOut(auth);
              toast.error("Access denied", {
                description: "You don't have permission to access this page"
              });
            } else {
              toast.error("Authentication failed", {
                description: error.response?.data?.message ?? error.message
              });
            }
          } else {
            toast.error("Authentication failed", {
              description: error instanceof Error ? error.message : "Unable to verify authentication"
            });
          }
          router.replace('/');
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-2 text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // User is authenticated, render the layout with sidebar
  // Get sidebar state from localStorage (since we can't use cookies in client components)
  const defaultOpen = typeof window !== 'undefined' 
    ? localStorage.getItem('sidebar_state') === 'true' 
    : true;

  return (
    <DashboardLayoutClient defaultOpen={defaultOpen}>
      <div className="p-6 h-full w-full">{children}</div>
    </DashboardLayoutClient>
  );
};

export default DashboardLayout;
