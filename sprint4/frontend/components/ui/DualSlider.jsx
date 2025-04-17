import { ClassNames } from "@emotion/react"
import { Slider } from "radix-ui"
import { cn } from '@/lib/utils'
export default function DualSlider({ className, onValueChange, defaultValue, ...props }) {

    return (
        <>
            <Slider.Root className={cn('relative flex w-full items-center',className)} {...props} onValueChange={onValueChange} defaultValue={defaultValue}>
                <Slider.Track className="relative h-2 w-full bg-gray-300 overflow-hidden rounded-full">
                    <Slider.Range className="bg-blue-600 h-full rounded-full absolute  "></Slider.Range>
                </Slider.Track>
                {
                    ( defaultValue ?? []).map((value, index) => {
                        return <>
                            <Slider.Thumb className="block h-5 w-5 rounded-full bg-blue-600  focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 focus-visible:border-none">
                                <span className=" absolute bottom-full">{value}</span>
                            </Slider.Thumb>
                        </>
                    })
                }
            </Slider.Root>

        </>
    )
}