"use client";
import { useMemo } from "react";

interface MetadataViewerProps {
  metadata: Record<string, any>;
}

function formatMetadataValue(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    if (value instanceof Date || (value._ctor && value.year)) {
      const date = new Date(value);
      return isNaN(date.getTime()) ? "" : date.toLocaleString();
    }

    if (Array.isArray(value)) {
      return value.map(formatMetadataValue).join(", ");
    }

    return JSON.stringify(value);
  }

  return String(value);
}

function extractGpsCoordinates(
  metadata: Record<string, any>
): { lat: number; lng: number } | null {
  if (metadata.GPSLatitude && metadata.GPSLongitude) {
    try {
      let lat = parseFloat(String(metadata.GPSLatitude));
      let lng = parseFloat(String(metadata.GPSLongitude));

      // if coordinate is negative, it should be S for latitude and W for longitude
      if (lat < 0) {
        metadata.GPSLatitudeRef = "S";
        lat = Math.abs(lat);
      } else {
        metadata.GPSLatitudeRef = "N";
      }

      if (lng < 0) {
        metadata.GPSLongitudeRef = "W";
        lng = Math.abs(lng);
      } else {
        metadata.GPSLongitudeRef = "E";
      }

      if (metadata.GPSLatitudeRef === "S") lat = -lat;
      if (metadata.GPSLongitudeRef === "W") lng = -lng;

      return { lat, lng };
    } catch (e) {
      console.error("Failed to parse GPS coordinates:", e);
    }
  }

  if (metadata.GPSPosition) {
    try {
      const gpsMatch = String(metadata.GPSPosition).match(
        /([0-9.-]+)[,\s]+([0-9.-]+)/
      );
      if (gpsMatch && gpsMatch.length >= 3) {
        let lat = parseFloat(gpsMatch[1]);
        let lng = parseFloat(gpsMatch[2]);

        // Handle cardinal directions for GPSPosition format as well
        if (lat < 0) {
          metadata.GPSLatitudeRef = "S";
          lat = Math.abs(lat);
        } else {
          metadata.GPSLatitudeRef = "N";
        }

        if (lng < 0) {
          metadata.GPSLongitudeRef = "W";
          lng = Math.abs(lng);
        } else {
          metadata.GPSLongitudeRef = "E";
        }

        // Apply the ref
        if (metadata.GPSLatitudeRef === "S") lat = -lat;
        if (metadata.GPSLongitudeRef === "W") lng = -lng;

        return { lat, lng };
      }
    } catch (e) {
      console.error("Failed to parse GPS position:", e);
    }
  }

  return null;
}

export function MetadataViewer({ metadata = {} }: MetadataViewerProps) {
  const gpsCoordinates = useMemo(
    () => extractGpsCoordinates(metadata),
    [metadata]
  );

  if (!metadata || Object.keys(metadata).length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col items-center space-y-3">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500 text-lg">
            No metadata found for this file
          </p>
        </div>
      </div>
    );
  }

  const formattedMetadata = Object.entries(metadata)
    .filter(([key, value]) => {
      // filter these specific fields
      if (
        key === "ExifToolVersion" ||
        key === "Directory" ||
        key === "SourceFile" ||
        key === "Error" ||
        key === "FilePermissions" ||
        key === "Creator" ||
        key === "Linearized" ||
        key.startsWith("_")
      ) {
        return false;
      }

      if (
        key === "FileTypeExtension" ||
        key === "FileType" ||
        key === "MIMEType"
      ) {
        if (key !== "MIMEType") return false;
      }

      const formattedValue = formatMetadataValue(value);
      if (formattedValue === "Invalid Date" || formattedValue === "") {
        return false;
      }

      return true;
    })
    .reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: formatMetadataValue(value),
      }),
      {} as Record<string, string>
    );

  return (
    <div>
      {gpsCoordinates && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Location</h3>
          <div className="rounded-xl overflow-hidden shadow-md h-64 relative">
            <iframe
              title="Image Location"
              className="w-full h-full border-0"
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${gpsCoordinates.lat},${gpsCoordinates.lng}&zoom=14`}
              allowFullScreen
            />
            <div className="absolute bottom-3 right-3 bg-white rounded-md px-3 py-1 shadow-md text-xs">
              {gpsCoordinates.lat.toFixed(6)}, {gpsCoordinates.lng.toFixed(6)}
            </div>
          </div>
          <div className="text-right mt-1">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${gpsCoordinates.lat},${gpsCoordinates.lng}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View in Google Maps
            </a>
          </div>
        </div>
      )}

      {/* Metadata table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Property
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(formattedMetadata).map(([key, value]) => (
              <tr key={key} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {key}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
