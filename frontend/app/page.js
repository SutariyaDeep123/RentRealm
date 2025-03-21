"use client"
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import Headers from "@/components/Headers";
import { useEffect, useState } from "react";
import axios from "axios";
import Products from "@/components/Products";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/listing`).then(response => {
      setProducts(response.data.data);
      console.log(response.data.data)
    }).catch((e) => {
      console.log(e)
    })
  }, [])

  return (

    <div >
      <div >
        <Headers className={" sticky top-0 w-full z-10"} />
        <div className=" relative">
          <Sidebar />
          <div className="lg:ml-72">
            <SearchBar className={" py-6 border border-b-2 "} />
            <div >
              <Products data={products} />
              
            </div>
          </div>
        </div>
      </div>
      {/* <Header /> */}
    </div>
  );
}
