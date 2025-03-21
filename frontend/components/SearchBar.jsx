import { IoSearch } from "react-icons/io5";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Select from "./ui/Select";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function SearchBar({className}) {
    const [fromDate, setFromDate] = useState();
    const [toDate, setToDate] = useState();
    const [travellers, setTravellers] = useState();

    return (
        <>
            <form className={cn(className)}> 
                <div className="flex flex-wrap flex-col lg:flex-row lg:flex-nowrap lg:items-end justify-center gap-4 lg:gap-7">
                    <Input type="date" lable="From" name="fromDate" onChange={e => setFromDate(e.target.value)} />
                    <Input type="date" lable="to" name="toDate" onChange={e => setToDate(e.target.value)} />
                    <Select options={[{ id: 0, lable: "select", disabled: true, selected: true }, { id: 1, lable: "2traveler,1room" }]} label="Travellers" name="travellers" onChange={e => setTravellers(e.target.value)} />
                    <Button className="rounded-full  lg:w-12 lg:h-12 flex items-center justify-center lg:p-0"><IoSearch className=" text-2xl hidden lg:block" /><span className="lg:hidden block text-lg">Search</span> </Button>
                </div>
            </form>
        </>
    )
}