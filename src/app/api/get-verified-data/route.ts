import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies(); // Await the cookies() function
    const verifiedData = cookieStore.get('verifiedData');

    if (!verifiedData || !verifiedData.value) {
      return NextResponse.json({ error: 'No verified data found' }, { status: 404 });
    }

    let data;
    try {
      data = JSON.parse(verifiedData.value);
    } catch (parseError) {
      console.error('Error parsing verifiedData:', parseError);
      return NextResponse.json({ error: 'Invalid data format' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching verified data:', error);
    return NextResponse.json({ error: 'Failed to fetch verified data' }, { status: 500 });
  }
}
