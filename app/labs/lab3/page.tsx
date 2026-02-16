"use client";
import dynamic from "next/dynamic";
import Image from "next/image";

const Lab3 = dynamic(() => import("./components/Lab3"), { ssr: false });

export default function Home() {
  return <Lab3 />;
}
