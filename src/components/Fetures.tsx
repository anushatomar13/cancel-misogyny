import Link from "next/link"
export default function FeturesSection(){
    return(
        <div className="">
            <div className="mt-8 flex gap-4 text-indigo-600 underline text-sm">
        <Link href="/about">About</Link>
        <Link href="/log-comment">Log Comment</Link>
        <Link href="/logbook">Logbook</Link>
        <Link href="/learn">Learn</Link>
      </div>
        </div>
    )
}