export const DRIVE_SYNC_SCRIPT_TEMPLATE = `/**
 * DEVRIAN BILLING STUDIO - GOOGLE DRIVE SYNC SCRIPT
 * ====================================================
 * Automatically creates and manages:
 * 📁 Google Drive
 *    └── 📁 DEVRIAN Billing Studio
 *         ├── 📁 Invoices/             (All Invoice PDFs)
 *         ├── 📁 Receipts/             (All Payment Receipt PDFs)
 *         └── 📄 devrian_database.json (Clients, Invoices, Settings backup)
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: "Empty request body" });
    }

    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    var rootFolder = getOrCreateFolder("DEVRIAN Billing Studio");
    var invoicesFolder = getOrCreateSubFolder(rootFolder, "Invoices");
    var receiptsFolder = getOrCreateSubFolder(rootFolder, "Receipts");

    // 1. Connection Ping Test
    if (action === "ping") {
      return jsonResponse({
        success: true,
        message: "Connected to Google Drive successfully! Folder: DEVRIAN Billing Studio",
        email: Session.getActiveUser().getEmail() || "Authorized User"
      });
    }

    // 2. Sync Full Database (Clients, Documents, Profile)
    if (action === "syncDatabase") {
      var dbFile = getOrCreateFile(rootFolder, "devrian_database.json", "application/json");
      dbFile.setContent(JSON.stringify(data.payload, null, 2));
      return jsonResponse({
        success: true,
        message: "Database synced successfully to Google Drive",
        updatedAt: new Date().toISOString()
      });
    }

    // 3. Fetch Database (Restore to any PC or phone)
    if (action === "fetchDatabase") {
      var files = rootFolder.getFilesByName("devrian_database.json");
      if (files.hasNext()) {
        var file = files.next();
        var content = file.getBlob().getDataAsString();
        return jsonResponse({
          success: true,
          data: JSON.parse(content),
          updatedAt: file.getLastUpdated().toISOString()
        });
      } else {
        return jsonResponse({
          success: false,
          message: "No database found on Google Drive yet. Save an invoice first."
        });
      }
    }

    // 4. Upload PDF File
    if (action === "uploadPdf") {
      var targetFolder = data.docType === "receipt" ? receiptsFolder : invoicesFolder;
      var fileName = data.fileName || ("DEVRIAN_" + Date.now() + ".pdf");
      var base64Data = data.base64Pdf;

      if (!base64Data) {
        return jsonResponse({ success: false, error: "No PDF data provided" });
      }

      if (base64Data.indexOf(",") > -1) {
        base64Data = base64Data.split(",")[1];
      }

      var decodedBytes = Utilities.base64Decode(base64Data);
      var pdfBlob = Utilities.newBlob(decodedBytes, "application/pdf", fileName);

      var existing = targetFolder.getFilesByName(fileName);
      if (existing.hasNext()) {
        var exFile = existing.next();
        exFile.setContent(pdfBlob.getDataAsString());
      } else {
        targetFolder.createFile(pdfBlob);
      }

      return jsonResponse({
        success: true,
        message: "PDF uploaded to " + (data.docType === "receipt" ? "Receipts" : "Invoices") + " folder: " + fileName
      });
    }

    return jsonResponse({ success: false, error: "Unknown action: " + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function doGet(e) {
  return jsonResponse({
    status: "active",
    service: "DEVRIAN Billing Studio - Google Drive Cloud Sync",
    timestamp: new Date().toISOString()
  });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateFolder(name) {
  var folders = DriveApp.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(name);
}

function getOrCreateSubFolder(parent, name) {
  var folders = parent.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parent.createFolder(name);
}

function getOrCreateFile(parent, name, mimeType) {
  var files = parent.getFilesByName(name);
  if (files.hasNext()) {
    return files.next();
  }
  return parent.createFile(name, "{}", mimeType);
}
`;

