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
    
    await exiftool.write(fullPath, {}, ['-all=', '-overwrite_original']);

    return NextResponse.json({
      success: true,
      message: 'Metadata deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting metadata:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete metadata' },
      { status: 500 }
    );
  }
} 