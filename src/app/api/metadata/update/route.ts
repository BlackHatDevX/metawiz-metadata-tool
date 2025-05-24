'use strict';

import { NextResponse } from 'next/server';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execPromise = promisify(exec);

function formatMetadataForWrite(metadata: Record<string, any>): Record<string, any> {
  const formatted: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(metadata)) {
    if (
      key === 'FileName' || 
      key === 'Directory' || 
      key === 'SourceFile' || 
      key === 'ExifToolVersion' ||
      key === 'FileSize' ||
      key === 'FileModifyDate' ||
      key === 'FileAccessDate' ||
      key === 'FileInodeChangeDate' ||
      key === 'FilePermissions' ||
      key.startsWith('Error') ||
      key.startsWith('Warning') ||
      key.startsWith('File')
    ) {
      continue;
    }
    
    if (value && typeof value === 'object' && value._ctor === 'ExifDateTime') {
      formatted[key] = value.rawValue;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (value._ctor === 'BinaryField') {
        continue;
      }
      formatted[key] = formatMetadataForWrite(value);
    } else {
      formatted[key] = value;
    }
  }
  
  return formatted;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filePath, metadata } = body;

    console.log('[MetaWiz Update API] Request received for filePath:', filePath);
    console.log('[MetaWiz Update API] Metadata from frontend:', JSON.stringify(metadata, null, 2));

    if (!filePath) {
      console.error('[MetaWiz Update API] Error: No file path provided.');
      return NextResponse.json(
        { success: false, error: 'No file path provided' },
        { status: 400 }
      );
    }

    if (!metadata || typeof metadata !== 'object') {
      console.error('[MetaWiz Update API] Error: Invalid metadata provided.', metadata);
      return NextResponse.json(
        { success: false, error: 'Invalid metadata provided' },
        { status: 400 }
      );
    }

    const fullPath = join(process.cwd(), 'uploads', filePath);
    console.log('[MetaWiz Update API] Full path to file:', fullPath);

    const formattedMetadata = formatMetadataForWrite(metadata);
    console.log('[MetaWiz Update API] Metadata formatted for writing:', JSON.stringify(formattedMetadata, null, 2));

    const tempFilePath = `${fullPath}.temp`;
    await fs.copyFile(fullPath, tempFilePath);
    
    try {
      const removeCommand = `exiftool -All= -m -overwrite_original "${tempFilePath}"`;
      console.log('[MetaWiz Update API] Removing all metadata from file:', removeCommand);
      await execPromise(removeCommand);

      const tempCommandFile = join(process.cwd(), 'uploads', `exiftool_cmd_${Date.now()}.txt`);
      let commandFileContent = '';
      
      for (const [key, value] of Object.entries(formattedMetadata)) {
        if (value !== null && value !== undefined && value !== '') {
          commandFileContent += `-${key}=${value}\n`;
        }
      }

      console.log('[MetaWiz Update API] Command file content (truncated):', 
        commandFileContent.length > 500 ? 
        commandFileContent.substring(0, 500) + '...' : 
        commandFileContent);
      
      await fs.writeFile(tempCommandFile, commandFileContent);
      
      const writeCommand = `exiftool -m -overwrite_original -@ "${tempCommandFile}" "${tempFilePath}"`;
      console.log('[MetaWiz Update API] Writing metadata back to file:', writeCommand);
      
      const { stdout, stderr } = await execPromise(writeCommand);
      
      if (stderr && !stderr.includes('Nothing to do')) {
        console.log('[MetaWiz Update API] ExifTool stderr:', stderr);
      }
      
      console.log('[MetaWiz Update API] ExifTool stdout:', stdout);
      
      await fs.copyFile(tempFilePath, fullPath);
      
      await fs.unlink(tempCommandFile);

    } catch (err) {
      console.error('[MetaWiz Update API] Error during metadata processing:', err);
      throw err;
    } finally {
      try {
        await fs.unlink(tempFilePath);
      } catch (err) {
        console.error('[MetaWiz Update API] Error deleting temp file:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Metadata updated successfully'
    });

  } catch (error) {
    console.error('[MetaWiz Update API] Error during metadata update process:', error);
    if (error && typeof error === 'object' && 'stderr' in error) {
      console.error('[MetaWiz Update API] ExifTool stderr:', (error as any).stderr);
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update metadata' },
      { status: 500 }
    );
  }
} 