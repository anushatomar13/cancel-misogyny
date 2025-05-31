"use client";
import { FocusCards } from "@/components/ui/focus-cards";

export default function FocusCardsDemo() {
 const cards = [
  {
    title: "Online Misogyny Manosphere",
    src: "/blogs/1.webp",
    link: "https://humanrights.ca/story/online-misogyny-manosphere",  
  },
  {
    title: "Online Misogyny and Abuse",
    src: "/blogs/2.jpg",
    link: "https://techsafety.org.au/resources/resources-women/online_misogyny/",
  },
  {
    title: "Violence against women on Twitter in India",
    src: "/blogs/3.jpg",
    link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10599529/",
  },
  {
    title: "Female-led Misogynistic Tweets",
    src: "/blogs/4.png",
    link: "https://www.theguardian.com/technology/2016/may/26/half-of-misogynistic-tweets-sent-by-women-study-finds",
  },
  {
    title: "Trump's sexist remarks on Taylor Swift",
    src: "/blogs/5.png",
    link: "https://www.livemint.com/entertainment/donald-trump-says-taylor-swift-is-no-longer-hot-after-i-hate-taylor-swift-internet-reacts-11747405042248.html",
  },
  {
    title: "She’s Not on the Team, But Still Blamed",
    src: "/blogs/6.jpg",
    link: "https://www.timesnownews.com/entertainment-news/ban-her-trolls-once-again-blame-virat-kohlis-wife-anushka-sharma-after-indias-loss-in-wtc-final-fans-defend-actress-article-100928332",
  },
];

  return (
   <div className=" w-full flex flex-col items-center mb-20 ">
  <h1 className="text-5xl font-nohemi-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-fuchsia-500 drop-shadow-lg tracking-wider uppercase py-10 -ml-30">
  UNDERSTANDING ONLINE MISOGYNY
</h1>



  <FocusCards cards={cards} />
</div>

  );
}
