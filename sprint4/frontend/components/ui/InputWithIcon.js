import { cn } from "@/lib/utils";

export default function InputWithIcon({ vertical = true, type = "text", lableStyle, lable, Icon, ...props }) {
    return <>
        <lable className={cn("p-2 ", lableStyle)}>{lable}</lable>
        <div className="relative">
            <input className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400" type={type} {...props} />
            <Icon className=" absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
    </>
}