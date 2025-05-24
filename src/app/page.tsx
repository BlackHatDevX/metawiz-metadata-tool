'use client';

import { useState, useEffect } from 'react';
import { FileUploader } from '@/components/FileUploader';
import { MetadataViewer } from '@/components/MetadataViewer';
import { MetadataEditor } from '@/components/MetadataEditor';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [serverFilePath, setServerFilePath] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'view' | 'edit' | null>(null);
  const [infoSection, setInfoSection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setActiveTab(null);
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setServerFilePath(data.filePath);
        const metadataResponse = await fetch('/api/metadata/view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filePath: data.filePath }),
        });
        const metadataData = await metadataResponse.json();
        setMetadata(metadataData.metadata || {});
        setSuccessMessage('File uploaded successfully!');
        setShowSuccessMessage(true);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMetadata = async () => {
    if (!serverFilePath) return;
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/metadata/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath: serverFilePath }),
      });
      const data = await response.json();
      if (data.success) {
        setMetadata({});
        setActiveTab(null);
        setSuccessMessage('Metadata deleted successfully! Downloading clean file...');
        setShowSuccessMessage(true);
        window.location.href = `/api/download?filePath=${encodeURIComponent(serverFilePath)}`;
      }
    } catch (error) {
      console.error('Error deleting metadata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMetadata = async (updatedMetadata: Record<string, string>, downloadAfter = false) => {
    if (!serverFilePath) return;
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/metadata/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath: serverFilePath,
          metadata: updatedMetadata
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMetadata(updatedMetadata);
        setActiveTab('view');
        if (downloadAfter) {
          setSuccessMessage('Metadata updated successfully! Downloading file...');
          window.location.href = `/api/download?filePath=${encodeURIComponent(serverFilePath)}`;
        } else {
          setSuccessMessage('Metadata updated successfully!');
        }
        setShowSuccessMessage(true);
      }
    } catch (error) {
      console.error('Error updating metadata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-xl flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            <p className="text-gray-700">Processing your file...</p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-800">
            METAWIZ
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            The simple, powerful tool for managing file metadata with complete privacy
          </p>
        </motion.div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Complete Metadata Control</h3>
            <p className="text-gray-600">View, edit, or completely remove metadata from your files with just a few clicks, including ICC profiles.</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Privacy Protection</h3>
            <p className="text-gray-600">Remove sensitive information like GPS locations, camera details, and timestamps before sharing your files.</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Fast & Secure</h3>
            <p className="text-gray-600">All processing happens on your device. Your files are never sent to external servers, ensuring total privacy.</p>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload Your File</h2>
          <p className="text-gray-600 mb-6">
            Start by uploading an image or document to view and manage its metadata. We support JPG, PNG, TIFF, PDF and many other formats.
          </p>
          <FileUploader onFileSelect={handleFileSelect} />
        </motion.div>
        
        <AnimatePresence>
          {selectedFile && serverFilePath && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-lg p-8 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">File Metadata</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedFile.name} • {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('view')}
                    className={`px-4 py-2 rounded-lg shadow-sm transition-all duration-200 font-medium border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 focus:bg-blue-100 ${activeTab === 'view' ? 'ring-2 ring-blue-200 translate-y-[-2px]' : ''}`}
                  >
                    View Metadata
                  </button>
                  <button
                    onClick={() => setActiveTab('edit')}
                    className={`px-4 py-2 rounded-lg shadow-sm transition-all duration-200 font-medium border border-green-600 text-green-600 bg-white hover:bg-green-50 focus:bg-green-100 ${activeTab === 'edit' ? 'ring-2 ring-green-200 translate-y-[-2px]' : ''}`}
                  >
                    Modify Metadata
                  </button>
                  <button
                    onClick={handleDeleteMetadata}
                    className="px-4 py-2 rounded-lg shadow-sm transition-all duration-200 font-medium border border-red-600 text-white bg-red-600 hover:bg-red-700 focus:bg-red-800 hover:translate-y-[-2px]"
                  >
                    Delete Metadata
                  </button>
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                {activeTab === 'view' && (
                  <motion.div
                    key="view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MetadataViewer metadata={metadata} />
                  </motion.div>
                )}
                
                {activeTab === 'edit' && (
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MetadataEditor
                      metadata={metadata}
                      onSave={handleUpdateMetadata}
                      onCancel={() => setActiveTab('view')}
                    />
                  </motion.div>
                )}
                
                {!activeTab && (
                  <motion.div
                    key="instructions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-12"
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <p className="text-gray-600 text-xl">File uploaded successfully!</p>
                      <p className="text-gray-500 max-w-lg">
                        Please choose an action above to view, modify, or delete the metadata in your file.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-center mb-8">Learn More About Metadata</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <button 
                onClick={() => setInfoSection(infoSection === 'what' ? null : 'what')} 
                className="flex justify-between items-center w-full p-4 text-left"
              >
                <h3 className="text-lg font-medium text-gray-800">What is metadata?</h3>
                <svg 
                  className={`w-6 h-6 transition-transform duration-300 ${infoSection === 'what' ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <AnimatePresence>
                {infoSection === 'what' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-4 pb-4"
                  >
                    <p className="text-gray-600 mb-4">
                      Metadata is information embedded in your files that describes the content, origin, and properties of the file.
                      Think of it as &quot;data about data&quot; - the behind-the-scenes details about your photos, documents, and other files.
                    </p>
                    <p className="text-gray-600 mb-4">
                      For example, a typical photo may contain metadata about:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 mb-4">
                      <li>When the photo was taken (date and time)</li>
                      <li>Which camera or phone was used (make and model)</li>
                      <li>Camera settings (aperture, shutter speed, ISO)</li>
                      <li>Where the photo was taken (GPS coordinates)</li>
                      <li>Image resolution and color profile information</li>
                      <li>Software used to edit the photo</li>
                      <li>Copyright information and owner details</li>
                    </ul>
                    <p className="text-gray-600">
                      This information can be useful for organization, but it may also contain private details you`&apos;d prefer not to share.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <button 
                onClick={() => setInfoSection(infoSection === 'why' ? null : 'why')} 
                className="flex justify-between items-center w-full p-4 text-left"
              >
                <h3 className="text-lg font-medium text-gray-800">Why would I want to modify metadata?</h3>
                <svg 
                  className={`w-6 h-6 transition-transform duration-300 ${infoSection === 'why' ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <AnimatePresence>
                {infoSection === 'why' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-4 pb-4"
                  >
                    <p className="text-gray-600 mb-4">
                      There are several important reasons why you might want to view, modify, or remove metadata from your files:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 mb-4">
                      <li><strong>Privacy:</strong> Remove location data, device information, or other personal details before sharing files online</li>
                      <li><strong>Organization:</strong> Add descriptive metadata to help categorize and search for your files</li>
                      <li><strong>Correction:</strong> Fix incorrect timestamps or other details that were automatically added</li>
                      <li><strong>Copyright Protection:</strong> Add ownership information and usage rights to your created works</li>
                      <li><strong>Compliance:</strong> Ensure files meet legal or organizational requirements for metadata</li>
                    </ul>
                    <p className="text-gray-600">
                      METAWIZ gives you complete control over what information stays with your files when you share them.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <button 
                onClick={() => setInfoSection(infoSection === 'icc' ? null : 'icc')} 
                className="flex justify-between items-center w-full p-4 text-left"
              >
                <h3 className="text-lg font-medium text-gray-800">ICC Profile Support</h3>
                <svg 
                  className={`w-6 h-6 transition-transform duration-300 ${infoSection === 'icc' ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <AnimatePresence>
                {infoSection === 'icc' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-4 pb-4"
                  >
                    <p className="text-gray-600 mb-4">
                      METAWIZ fully supports ICC profile metadata, which is crucial for maintaining accurate color reproduction across different devices and applications.
                    </p>
                    <p className="text-gray-600 mb-4">
                      Key ICC profile metadata that you can view and edit includes:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 mb-4">
                      <li><strong>ProfileCopyright:</strong> Copyright information for the color profile</li>
                      <li><strong>ProfileDescription:</strong> Human-readable description of the profile</li>
                      <li><strong>ProfileCreator:</strong> Information about who created the profile</li>
                      <li><strong>ColorSpace:</strong> Color space information (RGB, CMYK, etc.)</li>
                    </ul>
                    <p className="text-gray-600">
                      Our advanced metadata processing ensures that when you modify these values, the ICC profile structure remains intact and valid, preventing image color distortion.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            Have questions or need support? Contact us at <a href="mailto:jashgro@yandex.com" className="text-blue-600 hover:underline">jashgro@yandex.com</a>
          </p>
          <p className="text-gray-500 text-sm mt-2">
            &copy; {new Date().getFullYear()} METAWIZ • Made with ❤️ by <a href="https://github.com/blackhatdevx" className="text-blue-600 hover:underline">jashgro</a>
          </p>
        </div>
    </div>
    </main>
  );
}
