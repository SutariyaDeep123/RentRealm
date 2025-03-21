import { cn } from "@/lib/utils";
import Button from "./ui/Button"
import { useUser } from "./ui/UserContext"
import { FaRegCircleUser } from "react-icons/fa6";


export default function Headers({ className }) {
    const { user } = useUser()
    return (
        <>
            <header className={cn("flex justify-between bg-blue-600 text-white py-2 px-6", className)}>
                <h1 className="text-3xl">RentRealm</h1>

                {user.name ?
                    <>
                        <div className="flex gap-5">
                            <div className="flex items-center gap-2 text-2xl">
                                <FaRegCircleUser />
                                <span>Hello {user.name}</span>
                            </div>
                            <a href="/add-listing"><Button className={"text-lg"}>+ Add</Button></a>
                            <Button onClick={() => { localStorage.clear(); window.location.reload() }}>Logout</Button>
                        </div>
                    </> :
                    <>
                        <a href="/login"> <Button>Login</Button></a>
                    </>
                }
            </header>
        </>
    )
}