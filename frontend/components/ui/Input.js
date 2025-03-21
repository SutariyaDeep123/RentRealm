import { cn } from "@/lib/utils";

export default function Input({ vertical = true,lableStyle, type = "text", lable, ...props }) {
    return <>
        <lable className={cn(`p-2 capitalize`, lableStyle)}>{lable}</lable>
        <input type={type} className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400" {...props} />
    </>
}