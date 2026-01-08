import { NextRequest, NextResponse } from "next/server";
import { MANTLE_NETWORKS } from "@/lib/mantle";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    const startblock = searchParams.get("startblock") || "0";
    const chainid = searchParams.get("chainid");

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    if (!chainid) {
      return NextResponse.json({ error: "Chain ID is required" }, { status: 400 });
    }

    const apiKey = process.env.MANTLESCAN_API_KEY;
    if (!apiKey) {
      console.error("MANTLESCAN_API_KEY is not set");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Determine network based on chainid
    const isTestnet = chainid === "5003";
    const explorerApiUrl = isTestnet
      ? MANTLE_NETWORKS.testnet.explorerApiUrl
      : MANTLE_NETWORKS.mainnet.explorerApiUrl;

    const apiUrl = `${explorerApiUrl}?chainid=${chainid}&module=account&action=txlist&address=${address}&startblock=${startblock}&endblock=99999999&sort=desc&apikey=${apiKey}`;
    
    console.log(`Proxying transaction history request for ${address} on chain ${chainid}`);

    const response = await fetch(apiUrl);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching transaction history:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch transaction history" },
      { status: 500 }
    );
  }
}
