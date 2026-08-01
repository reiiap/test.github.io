import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getWalletSummary } from "@/lib/wallet/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const summary = await getWalletSummary(session.user.id);
  return NextResponse.json({ balance: summary.wallet.balance, transactions: summary.transactions });
}
