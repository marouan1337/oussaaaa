import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import dbConnect from '@/lib/db/connect';
import { User } from '@/lib/db/models/user';
import bcrypt from 'bcryptjs';

export async function PUT(request: Request) {
  const session: any = await getSession();

  if (!session?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, password, whatsappNumber } = body;

    await dbConnect();

    const user = await User.findById(session.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (name) {
      user.name = name;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    if (whatsappNumber || whatsappNumber === "") {
      if (whatsappNumber && !/^\d{9}$/.test(whatsappNumber)) {
        return NextResponse.json({ message: 'Invalid WhatsApp number format. It must be 9 digits.' }, { status: 400 });
      }
      user.whatsappNumber = whatsappNumber ? `212${whatsappNumber}` : '';
    }

    await user.save();

    return NextResponse.json({ message: 'Settings updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ message: 'An error occurred while updating settings' }, { status: 500 });
  }
}
