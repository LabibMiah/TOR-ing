"use client";
import Link from "next/link";
import style from "./Navbar.module.css";
import { usePathname } from "next/navigation";




export default function Navbar(){
    const pathname = usePathname();
    //remember to change this later
    const showSearch =
        pathname === "/about" ||
        pathname === "/equipment";



    return(

        <nav className={style.nav}>
            <div className={style.logo}>
                <div className={style.links}>
                    <Link href="/">TOR-ings</Link>
                </div>
            </div>
            {showSearch && (
                <div className={style.searchWrap}>
                    <input className={style.search}
                    type="text"
                    placeholder="" 
                    />
                </div>
            )}
            
            <div className={style.links}>

            
                <Link href="/">Home</Link>
                <Link href="/equipment">equipment</Link>
                <Link href="/contact">Contact us</Link>
                <Link href="/about">about</Link>
                <Link href="/login">Login</Link>
            </div>
        </nav>

        
    );

}