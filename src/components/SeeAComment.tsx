import Image from 'next/image';

export default function SeeACommentSection() {
    return (
        <div className="overflow-x-hidden">
            <div className="absolute h-[100vh] w-full flex justify-center items-center text-white z-10">
                SCROLL DOWN
            </div>
            <div className="grid place-items-center w-[100%] relative">
                <div className="columns max-w-[1200px] w-full relative px-[0] grid place-items-center grid-cols-[repeat(3,_1)] gap-[2vw] mt-[500px]">
                    <div className="columnw w-full relative grid gap-[2vw] grid-cols-[100%]">
                        <div className="col-item m-0 relative z-1">
<div className="img-wrap w-full h-auto relative">
                               
                               <Image src="/test.png" width={1000} height={3000} alt='testing'/>

                                
                            </div>
                        </div>
                        <div className="col-item m-0 relative z-1">
                            <div className="img-wrap w-full [aspect-ratio:0.6] h-auto relative overflow-hidden rounded-none">
                                {/* <Image
                                    src="/images/comment-demo.png"
                                    alt="demo"
                                    fill 
                                    className="object-cover object-[50%_20%]"
                                    style={{ backfaceVisibility: 'hidden' }}
                                /> */}
                            </div>
                        </div>
                        <div className="col-item m-0 relative z-1">
                            <div className="img-wrap w-full [aspect-ratio:0.6] h-auto relative overflow-hidden rounded-none">
                                {/* <Image
                                    src="/images/comment-demo.png"
                                    alt="demo"
                                    fill 
                                    className="object-cover object-[50%_20%]"
                                    style={{ backfaceVisibility: 'hidden' }}
                                /> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
