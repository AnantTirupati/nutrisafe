import { redirect } from "next/navigation";

export default function SafeFoodsRedirect() {
  redirect("/scan#safe-foods");
}
