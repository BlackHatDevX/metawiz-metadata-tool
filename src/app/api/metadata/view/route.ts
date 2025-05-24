import { NextResponse } from 'next/server';
import { join } from 'path';
import { ExifTool } from 'exiftool-vendored';

const exiftool = new ExifTool();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filePath } = body;

    if (!filePath) {
      return NextResponse.json(
        { success: false, error: 'No file path provided' },
        { status: 400 }
      );
    }

    const fullPath = join(process.cwd(), 'uploads', filePath);
    
    const metadata = await exiftool.read(fullPath);
    
    return NextResponse.json({
      success: true,
      metadata
    });

  } catch (error) {
    console.error('Error processing metadata:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process metadata' },
      { status: 500 }
    );
  }
} 