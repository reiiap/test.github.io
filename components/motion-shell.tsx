"use client";
import { motion } from "framer-motion";
export function MotionShell({children,className}:{children:React.ReactNode;className?:string}){return <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:.7,ease:'easeOut'}} className={className}>{children}</motion.div>}
