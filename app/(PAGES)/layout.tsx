"use client";
import Footer from "@/components/Footer";
import Loader from "@/components/loader";
import Navbar from "@/components/Navbar";
import { getUserProfile } from "@/lib/features/authSlice";
import { getResults } from "@/lib/features/quizSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, loading, error } = useAppSelector((state) => state.auth);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Ensures proper loading before rendering

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken && !path.includes("auth")) {
      router.replace("/auth/login"); // Redirect to login page if no token exists
    } else if (storedToken) {
      dispatch(getUserProfile()).finally(() => setIsCheckingAuth(false));
    } else {
      setIsCheckingAuth(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, path]);
  useEffect(() => {
    if (user) {
      dispatch(getResults(user._id));
    }
  }, [dispatch, user]);
  useEffect(() => {
    if (error === "Invalid or expired token") {
      router.replace("/auth/login");
    }
  }, [error, router]);

  useEffect(() => {
    if (
      !loading &&
      !user &&
      !path.includes("auth") &&
      !localStorage.getItem("token")
    ) {
      router.replace("/auth/login");
    }
  }, [loading, path, router, user]);

  // Show loader while checking authentication
  if ((isCheckingAuth || loading) && !path.includes("auth")) {
    return <Loader />;
  }

  // Allow public access to auth pages
  if (path.includes("auth")) {
    return <main className="w-full h-fit min-h-screen">{children}</main>;
  }

  return (
    <div className="w-full">
      <Navbar />
      <main className="w-full h-fit min-h-screen">{children}</main>
      <Footer />
    </div>
  );
}
