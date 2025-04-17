import { cn } from "@/lib/utils";

export default function Select({ options, label,lableStyle, ...props }) {
    return (
        <>
            <label className={cn("p-2",lableStyle)}>{label}</label>
            <select className="w-full bg-gray-100 p-2 rounded border border-gray-300"  {...props}>
                {
                    options.map((value, index) => <option value={value.id} selected={value.selected} disabled={value.disabled}>{value.lable}</option>)
                }
            </select>
        </>
    )
}