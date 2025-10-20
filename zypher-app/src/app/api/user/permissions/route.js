import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import User from '@/models/User';
import connectDB from '@/utils/db';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await connectDB();
    
    // Get user from database to check their plan
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Determine permissions based on user's plan
    // Free plan doesn't have custom rule request permission
    // Higher-tier plans (premium, business, enterprise) have it
    const isFreeUser = !user.plan || user.plan === 'free';
    
    // Set permissions based on plan
    const permissions = {
      customRuleRequest: !isFreeUser,
      // Add other permission checks as needed
    };

    return new Response(JSON.stringify({ 
      permissions
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error checking user permissions:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}