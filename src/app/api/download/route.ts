import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('filePath');

    if (!filePath) {
      return NextResponse.json(
        { success: false, error: 'No file path provided' },
        { status: 400 }
      );
    }

    const fullPath = join(process.cwd(), 'uploads', filePath);
    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    const fileBuffer = await readFile(fullPath);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Disposition': `attachment; filename="${filePath}"`,
        'Content-Type': 'application/octet-stream',
      },
    });

  } catch (error) {
    console.error('Error in download:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to download file' },
      { status: 500 }
    );
  }
} 