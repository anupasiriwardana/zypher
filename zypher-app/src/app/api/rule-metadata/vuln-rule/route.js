import VulnRuleMetadata from "@/models/VULN_rule_metadata";
import connectDB from "@/utils/db";
import { NextResponse } from "next/server";

export const GET = async () => {  
  await connectDB();
  try {
    const vuln_rule_metadata = await VulnRuleMetadata.find();

    if(!vuln_rule_metadata || vuln_rule_metadata.length === 0) {
        return new NextResponse(
            JSON.stringify({
                error: "No vulnerability rule metadata found."
            }),
            { status: 404 }
        );
    }
    return new NextResponse(
      JSON.stringify(vuln_rule_metadata), 
      { status: 200 }
    );
    
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal server error"
      }), 
      { status: 500 }
    );
  }
};