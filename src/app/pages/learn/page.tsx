"use client";
import { FocusCards } from "@/components/ui/focus-cards";

export default function FocusCardsDemo() {
  const cards = [
    {
      title: "Online Misogyny Manosphere",
      src: "/blogs/1.webp",
    },
    {
      title: "Online Misogyny and Abuse",
      src: "/blogs/2.jpg",
    },
    {
      title: "Violence against women on Twitter in India",
      src: "/blogs/3.jpg",
    },
    {
      title: "Female-led Misogynistic Tweets",
      src: "/blogs/4.png",
    },
    {
      title: "Trump's sexist remarks on Taylor Swift",
      src: "/blogs/5.png",
    },
    {
      title: "She’s Not on the Team, But Still Blamed",
      src: "/blogs/6.jpg",
    },
  ];

  return (
   <div className=" w-full flex flex-col items-center">
  <h1 className="text-3xl font-nohemi-bold text-center mb-4 ">
    UNDERSTANDING ONLINE MISOGYNY
  </h1>
  <FocusCards cards={cards} />
</div>

  );
}
