import type { Metadata } from "next";
import Broken from "@/components/site/not-found/Broken";

export const metadata: Metadata = { title: "Página no encontrada" };

export default function NotFound() {
  return <Broken />;
}
