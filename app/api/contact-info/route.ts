import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { User } from '@/lib/db/models/user';

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET() {
  try {
    await dbConnect();
    // 1. Prioritize the user with the 'admin' role
    let contactUser = await User.findOne({ role: 'admin' }).select('whatsappNumber');

    // 2. If no admin or admin has no number, find the first user in the DB as a fallback
    if (!contactUser || !contactUser.whatsappNumber) {
      contactUser = await User.findOne({}).sort({ createdAt: 1 }).select('whatsappNumber');
    }

    // 3. Return the found number or a default
    if (contactUser && contactUser.whatsappNumber) {
      return NextResponse.json({ whatsappNumber: contactUser.whatsappNumber }, { status: 200 });
    } else {
      // Fallback to a default number if no user has a number set
      return NextResponse.json({ whatsappNumber: '212600000000' }, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching contact info:', error);
    // On error, return a default number to ensure the button still works
    return NextResponse.json({ message: 'Error fetching contact info' , whatsappNumber: '212600000000' }, { status: 500 });
  }
}
