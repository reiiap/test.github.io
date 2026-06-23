import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/security";
const schema=z.object({serviceId:z.string().optional(),title:z.string().min(3),description:z.string().min(10),amount:z.number().int().positive(),files:z.array(z.string().url()).default([])});
export async function GET(){const s=await getServerSession(authOptions);if(!s?.user)return NextResponse.json({error:'Unauthorized'},{status:401});const orders=await prisma.order.findMany({where:{userId:s.user.id},include:{payments:true,invoice:true,notes:true},orderBy:{createdAt:'desc'}});return NextResponse.json({orders})}
export async function POST(req:Request){const s=await getServerSession(authOptions);if(!s?.user)return NextResponse.json({error:'Unauthorized'},{status:401});const limit=rateLimit(`orders:${s.user.id}`,5,60_000);if(!limit.ok)return NextResponse.json({error:'Too many order attempts'},{status:429});const body=await req.json().catch(()=>null);const parsed=schema.safeParse(body);if(!parsed.success)return NextResponse.json({error:'Invalid order payload',issues:parsed.error.flatten()},{status:400});const order=await prisma.order.create({data:{...parsed.data,userId:s.user.id,orderNumber:`RK-${Date.now()}`}});await prisma.notification.create({data:{userId:s.user.id,type:'ORDER',title:'Order created',message:`${order.title} is now pending review.`}});return NextResponse.json({ok:true,order},{status:201})}
