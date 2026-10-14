import type { Metadata } from "next";
import V3Monumental from "@/components/site/not-found/V3Monumental";

export const metadata: Metadata = { title: "Página no encontrada" };

export default function NotFound() {
  return <V3Monumental />;
}
