# METAWIZ - Privacy-First Metadata Management

METAWIZ is a web application designed to help you easily view, edit, and remove metadata from your files. It prioritizes your privacy by processing all files directly in your browser, ensuring that your data never leaves your computer.

## Features

*   **View Metadata:** Upload a file and see all its embedded metadata, including EXIF, IPTC, XMP, and ICC profiles.
*   **Edit Metadata:** Modify existing metadata fields or add new ones. Correct timestamps, add copyright information, or include descriptive tags.
*   **Delete Metadata:** Completely remove all metadata from your files with a single click, helping you protect sensitive information before sharing.
*   **Privacy-Focused:** All file processing happens locally in your browser. Your files are never uploaded to a server.
*   **Wide File Type Support:** Works with various file formats, including JPG, PNG, TIFF, PDF, and more.
*   **ICC Profile Management:** View and edit ICC color profile metadata to ensure color consistency.
*   **User-Friendly Interface:** Simple and intuitive design, making metadata management accessible to everyone.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18 or later recommended)
*   Yarn (or npm/pnpm/bun)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/blackhatdevx/metawiz-metadata-tool.git 
    ```
2.  Navigate to the project directory:
    ```bash
    cd metawiz
    ```
3.  Install dependencies:
    ```bash
    yarn install
    # or
    # npm install
    # or
    # pnpm install
    ```

### Running the Development Server

To start the development server, run:

```bash
yarn dev
# or
# npm run dev
# or
# pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1.  **Upload a File:** Drag and drop a file onto the upload area or click to select a file from your computer.
2.  **View Metadata:** Once uploaded, the application will display the file's metadata.
3.  **Modify or Delete:**
    *   Click "Modify Metadata" to edit or add metadata fields. Save your changes.
    *   Click "Delete Metadata" to remove all metadata from the file.
4.  **Download:** After deleting or successfully updating metadata, the modified file will be automatically downloaded. You can also download the file by clicking appropriate buttons if available.

## Technology Stack

*   **Frontend:** Next.js (React framework), TypeScript, Tailwind CSS, Framer Motion
*   **Metadata Processing:** `exiftool-vendored` (Node.js wrapper for ExifTool)
*   **Deployment:** (Specify your deployment platform, e.g., Vercel, Netlify, AWS)

## Project Structure

*   `src/app/`: Contains the main application pages and API routes.
    *   `src/app/page.tsx`: The main page component for the METAWIZ application.
    *   `src/app/api/`: Backend API routes for file operations.
        *   `upload/`: Handles file uploads.
        *   `metadata/`: Handles metadata viewing, updating, and deletion.
        *   `download/`: Handles file downloads.
*   `src/components/`: Reusable React components.
    *   `FileUploader.tsx`: Component for file uploading.
    *   `MetadataViewer.tsx`: Component for displaying metadata.
    *   `MetadataEditor.tsx`: Component for editing metadata.
*   `public/`: Static assets.
*   `uploads/`: Directory where files are temporarily stored for processing (created automatically). This directory should ideally be added to `.gitignore` if not already.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

(Add guidelines for contributing if you have specific ones)

## License

MIT License

## Contact

If you have any questions or feedback, please reach out to:

*   Jash Gro - [jashgro@yandex.com](mailto:jashgro@yandex.com)
*   Project Link: [https://github.com/blackhatdevx/metawiz-metadata-tool](https://github.com/blackhatdevx/metawiz-metadata-tool) 
*   Portfolio: [https://bit.ly/jashgro](https://bit.ly/jashgro)

---

Built with ❤️ for privacy.
