import Loader from "@/components/loader";
import React, { Suspense } from "react";

type props = {
  children: React.ReactNode;
};
export default function AuthLayout({ children }: Readonly<props>) {
  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center py-10">
          <Loader />
        </div>
      }
    >
      <div className="w-full">
        <main className="w-full h-fit min-h-screen">{children}</main>
      </div>
    </Suspense>
  );
}
