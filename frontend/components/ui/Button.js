import { cn } from "@/lib/utils";

export default function Button({ children,className,...props }) {
    return <button className={cn("bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300",className)} {...props}>{children}</button>
}