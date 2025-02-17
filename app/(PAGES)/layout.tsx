"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { getUserProfile } from "@/lib/features/authSlice";
import { getResults } from "@/lib/features/quizSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Ensures proper loading before rendering

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      dispatch(getUserProfile()).finally(() => setIsCheckingAuth(false));
    } else {
      setIsCheckingAuth(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(getResults(user._id));
    }
  }, [dispatch, user]);



 

  // Show loader while checking authentication
  if ((isCheckingAuth || loading) && !path.includes("auth")) {
    return (
      <div className="fixed py-5 px-2 inset-0 w-full h-full flex items-center justify-end flex-col gap-0">
        <Image
          className="size-32 animate-pulse absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          src={"/assets/icon.svg"}
          alt="quizeen icon"
          width={100}
          height={100}
          loading="lazy"
        />

        <div className="">
          <strong className="text-sm text-neutral-600">
            Quizeen by Asterixh
          </strong>
        </div>
      </div>
    );
  }

  if (
    (!loading &&
    !user &&
    !path.includes("auth") &&
    !localStorage.getItem("token"))||
    error
  ) {
    return(
      <div className="fixed py-5 px-2 inset-0 w-full h-full flex items-center justify-end flex-col gap-0">
      <div className="w-fit absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-10">
      <Image
        className="size-32"
        src={"/assets/icon.svg"}
        alt="quizeen icon"
        width={100}
        height={100}
        loading="lazy"
      />

     <div className="w-full flex flex-col gap-4 items-center animate-reveal">
      <div className="w-full flex flex-col items-center gap-2">
      <h1 className="text-2xl font-bold">Welcome to Quizeen</h1>
      <p className="text-sm text-neutral-500">Walk the path of knowledge</p>
      </div>
     <div className="w-full flex items-center justify-between gap-2">
        <Link href="/auth/register">
        <Button variant="default" className="min-w-28">Register</Button>
        </Link>
        <Link href="/auth/login">
        <Button variant="outline" className="min-w-28">Login</Button>
        </Link>
      </div>
     </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-2">
        <strong className="text-sm text-neutral-600">
          Quizeen by <a className="text-blue-600" href="https://github.com/CodeWithAsterixh">Asterixh</a>
        </strong>
      </div>
    </div>
    )
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
