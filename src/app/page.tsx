"use client";
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function Home() {
  const { user, isSignedIn } = useUser();
  return (
    <main  className="bg-black">
      <div className="">
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="default">
              Sign in
            </Button>

          </SignInButton>

          <SignUpButton>
            <Button variant="default">
              Sign up
            </Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>

          <span>Hi, {user?.firstName || user?.username || user?.primaryEmailAddress?.emailAddress}</span>
          <UserButton />
        </SignedIn>
      </div>
<h1 className="text-white">
  Cancel Misogyny
</h1>
<p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque necessitatibus harum nam repellat consectetur ducimus, repellendus minus </p>
    </main>
  );
}
