import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import dbConnect from '@/lib/db/connect';
import { User } from '@/lib/db/models/user';

export async function GET() {
  const session: any = await getSession();

  if (!session?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    await dbConnect();
    const user = await User.findById(session.id).select('name email whatsappNumber');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const whatsappNumberLast9 = user.whatsappNumber ? user.whatsappNumber.slice(3) : '';

    return NextResponse.json({ 
        name: user.name, 
        email: user.email, 
        whatsappNumber: whatsappNumberLast9 
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ message: 'An error occurred while fetching user data' }, { status: 500 });
  }
}
