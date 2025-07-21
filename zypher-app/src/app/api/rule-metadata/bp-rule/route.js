import BPRuleMetadata from "@/models/BP_rule_metadata";
import connectDB from "@/utils/db";
import { NextResponse } from "next/server";

export const GET = async () => {  
  await connectDB();
  try {
    const bp_rule_metadata = await BPRuleMetadata.find();

    if(!bp_rule_metadata || bp_rule_metadata.length === 0) {
        return new NextResponse(
            JSON.stringify({
                error: "No best practice rule metadata found."
            }),
            { status: 404 }
        );
    }
    return new NextResponse(
      JSON.stringify(bp_rule_metadata), 
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