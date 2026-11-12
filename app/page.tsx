import DevverseApp from "@/components/DevverseApp";
import { display, body } from "./fonts";

export default function Page() {
  return <DevverseApp fonts={{ display: display.style.fontFamily, body: body.style.fontFamily }} />;
}
