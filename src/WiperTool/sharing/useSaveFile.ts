type SaveFileOptions = {
  blob: Blob;
  fileName: string;
  typeDescription?: string;
  mimeType?: `${string}/${string}`;
  extensions?: string[];
};

const fallbackDownload = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

export function useSaveFile() {
  const saveFile = async ({
    blob,
    fileName,
    typeDescription = 'File',
    mimeType,
    extensions,
  }: SaveFileOptions): Promise<boolean> => {
    if (window.showSaveFilePicker) {
      try {
        const normalizedExtensions = extensions?.map((ext) => (ext.startsWith('.') ? ext : `.${ext}`)) as
          | `.${string}`[]
          | undefined;

        const types: FilePickerAcceptType[] | undefined =
          mimeType && normalizedExtensions?.length
            ? [
                {
                  description: typeDescription,
                  accept: {
                    [mimeType]: normalizedExtensions,
                  },
                },
              ]
            : undefined;

        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types,
        });

        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return true;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return false;
        }

        throw error;
      }
    }

    fallbackDownload(blob, fileName);
    return true;
  };

  return { saveFile };
}
