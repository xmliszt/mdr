import { ProgressExporter } from "@/app/lumon/mdr/components/progress-exporter";
import { ProgressImporter } from "@/app/lumon/mdr/components/progress-importer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  BrainCog,
  Check,
  Copy,
  Download,
  File,
  Loader,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type ImportStatus = "idle" | "loading" | "success" | "error";
type ExportStatus = "idle" | "loading" | "success" | "error";
type TabValue = "export" | "import";

export function ProgressImporterExporter() {
  const [activeTab, setActiveTab] = useState<TabValue>("export");
  const [importStatus, setImportStatus] = useState<ImportStatus>("idle");
  const [exportStatus, setExportStatus] = useState<ExportStatus>("idle");
  const [importError, setImportError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<string>("");
  const [decryptionKey, setDecryptionKey] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  const [exportedFileInfo, setExportedFileInfo] = useState<{
    downloadUrl: string;
    fileName: string;
  } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressExporter = useRef(new ProgressExporter());
  const progressImporter = useRef(new ProgressImporter());

  const handleExport = useCallback(async () => {
    setExportStatus("loading");
    setExportError(null);

    try {
      const { key, downloadUrl, fileName } =
        await progressExporter.current.exportProgress();
      setEncryptionKey(key);
      setExportedFileInfo({ downloadUrl, fileName });
      setExportStatus("success");
    } catch (error) {
      console.error("Export failed:", error);
      setExportError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      setExportStatus("error");
    }
  }, []);

  const handleCopyKey = useCallback(async () => {
    try {
      await progressExporter.current.copyToClipboard(encryptionKey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy key:", error);
    }
  }, [encryptionKey]);

  const handleDownload = useCallback(() => {
    if (!exportedFileInfo) return;

    const link = document.createElement("a");
    link.href = exportedFileInfo.downloadUrl;
    link.download = exportedFileInfo.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [exportedFileInfo]);

  // Auto download when export is successful
  useEffect(() => {
    if (exportStatus === "success" && exportedFileInfo) {
      handleDownload();
    }
  }, [exportStatus, exportedFileInfo, handleDownload]);

  // Refresh page when dialog closes after successful import
  useEffect(() => {
    if (!open && importStatus === "success") {
      window.location.reload();
    }
  }, [open, importStatus]);

  const processFile = useCallback(
    async (file: File) => {
      setImportStatus("loading");
      setImportError(null);

      try {
        const fileReader = new FileReader();

        fileReader.onload = async (e) => {
          const encryptedData = e.target?.result as string;

          if (!decryptionKey.trim()) {
            setImportError("Please enter a decryption key");
            setImportStatus("error");
            return;
          }

          try {
            const success = await progressImporter.current.importProgress(
              encryptedData,
              decryptionKey
            );

            if (success) {
              setImportStatus("success");
            } else {
              setImportError(
                "Failed to import progress data. Invalid key or corrupted file."
              );
              setImportStatus("error");
            }
          } catch (error) {
            console.error("Import failed:", error);
            setImportError(
              error instanceof Error ? error.message : "Unknown error occurred"
            );
            setImportStatus("error");
          }
        };

        fileReader.onerror = () => {
          setImportError("Failed to read file");
          setImportStatus("error");
        };

        fileReader.readAsText(file);
      } catch (error) {
        console.error("Import failed:", error);
        setImportError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
        setImportStatus("error");
      }
    },
    [decryptionKey]
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setSelectedFile(file);
    },
    []
  );

  const handleImport = useCallback(() => {
    if (selectedFile) {
      processFile(selectedFile);
    }
  }, [selectedFile, processFile]);

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
    },
    []
  );

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
    }
  }, []);

  const resetImport = useCallback(() => {
    setImportStatus("idle");
    setImportError(null);
    setDecryptionKey("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const resetExport = useCallback(() => {
    setExportStatus("idle");
    setExportError(null);
    setEncryptionKey("");
    setExportedFileInfo(null);
  }, []);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as TabValue);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-default" variant="ghost" size="icon">
          <BrainCog className="size-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Import / Export Progress</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 pt-4">
            {exportStatus === "idle" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Export your progress data to a file. You will need to save the
                  encryption key to import the data later.
                </p>
                <Button onClick={handleExport} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export Progress
                </Button>
              </div>
            )}

            {exportStatus === "loading" && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            {exportStatus === "success" && (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Your Macrodata Refinement progress has been successfully
                    archived. Please secure the encryption key below for future
                    restoration purposes.
                  </AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <AlertDescription>
                    REMINDER: Sharing this file with your outie is strictly
                    prohibited and violates Lumon Industries security protocol.
                    For innie restoration purposes only.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="encryption-key">Encryption Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="encryption-key"
                      value={encryptionKey}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      size="icon"
                      onClick={handleCopyKey}
                      variant="outline"
                    >
                      {isCopied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button onClick={handleDownload} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Again
                </Button>
              </div>
            )}

            {exportStatus === "error" && (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {exportError ||
                      "An error occurred while exporting your progress data."}
                  </AlertDescription>
                </Alert>
                <Button onClick={resetExport} className="w-full">
                  Try Again
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="import" className="space-y-4 pt-4">
            {importStatus === "idle" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Import your progress data from a file. You will need the
                  encryption key that was provided when you exported the data.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="decryption-key">Decryption Key</Label>
                  <Input
                    id="decryption-key"
                    value={decryptionKey}
                    onChange={(e) => setDecryptionKey(e.target.value)}
                    placeholder="Enter your decryption key"
                    className="font-mono text-xs"
                  />
                </div>

                <div
                  className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedFile ? (
                    <>
                      <File className="size-6 mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="size-6 mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        Click or drag and drop to upload
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Only .mdr files are supported
                      </p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mdr"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {selectedFile && (
                  <Button onClick={handleImport} className="w-full">
                    <Upload className="mr-2 size-4" />
                    Import Progress
                  </Button>
                )}
              </div>
            )}

            {importStatus === "loading" && (
              <div className="flex items-center justify-center py-8">
                <Loader className="animate-spin size-6" />
              </div>
            )}

            {importStatus === "success" && (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription className="text-sm">
                    Your macro data progress has been successfully restored. The
                    system will now reboot, and you may continue your glorious
                    work as a diligent refiner. Praise Kier.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {importStatus === "error" && (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>
                    {importError ||
                      "An error occurred while importing your progress data."}
                  </AlertDescription>
                </Alert>
                <Button onClick={resetImport} className="w-full">
                  Try Again
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
