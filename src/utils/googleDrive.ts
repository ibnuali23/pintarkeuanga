export const saveToGoogleDrive = async ({
  filename,
  content,
  accessToken,
  mimeType = 'application/pdf',
}: {
  filename: string;
  content: string; // Base64 content
  accessToken: string;
  mimeType?: string;
}) => {
  try {
    // 1. Create the metadata for the file
    const metadata = {
      name: filename,
      mimeType: mimeType,
    };

    // 2. We use the Multipart upload approach for Google Drive API v3
    const boundary = 'foo_bar_baz';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}\r\n` +
      'Content-Transfer-Encoding: base64\r\n\r\n' +
      content +
      closeDelimiter;

    // 3. Make the API call to Google Drive
    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Google Drive API Error: ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json();
    return {
      url: `https://drive.google.com/file/d/${result.id}/view`,
    };
  } catch (error) {
    console.error('Error saving directly to Google Drive REST API:', error);
    throw error;
  }
};
