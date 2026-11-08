export const DRIVE_SYNC_SCRIPT_TEMPLATE = `/**
 * DEVRIAN BILLING STUDIO - ADVANCED GOOGLE DRIVE SYNC SCRIPT
 * ==========================================================
 * Target Account: neelamrajput658@gmail.com
 *
 * EXACT FOLDER HIERARCHY:
 * 📁 DEVRIAN AGENCY
 *    └── 📁 PRIVATE
 *         ├── 📁 DOCS
 *         │    └── 📄 devrian_database.json (All studio data, dashboard, profile, clients)
 *         │
 *         └── 📁 CLIENTS
 *              └── 📁 [Client Name] (e.g. "Anshita Singh Parihar")
 *                   └── 📁 PAYMENTS
 *                        ├── 📁 INVOICES               (Client Invoice PDFs)
 *                        ├── 📁 RECEIPTS               (Client Receipt PDFs)
 *                        └── 📁 PROPOSALS & QUOTATIONS (Client Proposals / Quotations)
 *
 * 🔒 SECURITY: Protected by private SYNC_SECURITY_PIN matching Studio Settings.
 */

// =====================================================
// 🔑 YOUR PRIVATE SECURITY PIN (Matches Studio Settings)
// =====================================================
var SYNC_SECURITY_PIN = "DEVRIAN@2026";

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: "Empty request body" });
    }

    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    // 🔒 SECURITY CHECK: Reject any request without the exact matching PIN
    if (SYNC_SECURITY_PIN && SYNC_SECURITY_PIN.trim() !== "") {
      if (!data.secretPin || data.secretPin.trim() !== SYNC_SECURITY_PIN.trim()) {
        return jsonResponse({
          success: false,
          error: "Access Denied: Invalid Security PIN. Unauthorized attempt."
        });
      }
    }

    // Build the exact DEVRIAN AGENCY folder structure
    var rootAgency = getOrCreateFolder("DEVRIAN AGENCY");
    var privateFolder = getOrCreateSubFolder(rootAgency, "PRIVATE");
    var docsFolder = getOrCreateSubFolder(privateFolder, "DOCS");
    var clientsRootFolder = getOrCreateSubFolder(privateFolder, "CLIENTS");

    // 1. Connection Ping Test
    if (action === "ping") {
      return jsonResponse({
        success: true,
        message: "Connected to Google Drive successfully! Structure: DEVRIAN AGENCY / PRIVATE / (DOCS + CLIENTS)",
        email: Session.getActiveUser().getEmail() || "Authorized User"
      });
    }

    // 2. Sync Full Database (Clients, Documents, Profile, Dashboard) -> Saved in PRIVATE/DOCS
    if (action === "syncDatabase") {
      var dbFile = getOrCreateFile(docsFolder, "devrian_database.json", "application/json");
      dbFile.setContent(JSON.stringify(data.payload, null, 2));
      return jsonResponse({
        success: true,
        message: "Database synced successfully to DEVRIAN AGENCY/PRIVATE/DOCS",
        updatedAt: new Date().toISOString()
      });
    }

    // 3. Fetch Database (Restore to any PC or phone) -> Fetched from PRIVATE/DOCS
    if (action === "fetchDatabase") {
      var files = docsFolder.getFilesByName("devrian_database.json");
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
          message: "No database found in DEVRIAN AGENCY/PRIVATE/DOCS yet. Save an invoice first."
        });
      }
    }

    // 4. Upload PDF File -> Saved in PRIVATE/CLIENTS/[Client Name]/PAYMENTS/(INVOICES | RECEIPTS | PROPOSALS & QUOTATIONS)
    if (action === "uploadPdf") {
      var clientName = (data.clientName || "General Client").trim();
      var docType = (data.docType || "invoice").toLowerCase();
      var fileName = data.fileName || ("DEVRIAN_" + Date.now() + ".pdf");
      var base64Data = data.base64Pdf;

      if (!base64Data) {
        return jsonResponse({ success: false, error: "No PDF data provided" });
      }

      // Strip data URL scheme prefix if included
      if (base64Data.indexOf(",") > -1) {
        base64Data = base64Data.split(",")[1];
      }

      // Navigate / Auto-create client hierarchy
      var clientFolder = getOrCreateSubFolder(clientsRootFolder, clientName);
      var paymentsFolder = getOrCreateSubFolder(clientFolder, "PAYMENTS");

      var invoicesFolder = getOrCreateSubFolder(paymentsFolder, "INVOICES");
      var receiptsFolder = getOrCreateSubFolder(paymentsFolder, "RECEIPTS");
      var proposalsFolder = getOrCreateSubFolder(paymentsFolder, "PROPOSALS & QUOTATIONS");

      var targetFolder;
      var targetFolderName;

      if (docType === "receipt") {
        targetFolder = receiptsFolder;
        targetFolderName = "RECEIPTS";
      } else if (docType === "quotation" || docType === "proposal") {
        targetFolder = proposalsFolder;
        targetFolderName = "PROPOSALS & QUOTATIONS";
      } else {
        targetFolder = invoicesFolder;
        targetFolderName = "INVOICES";
      }

      var decodedBytes = Utilities.base64Decode(base64Data);
      var pdfBlob = Utilities.newBlob(decodedBytes, "application/pdf", fileName);

      // Overwrite existing file or create new
      var existing = targetFolder.getFilesByName(fileName);
      if (existing.hasNext()) {
        var exFile = existing.next();
        exFile.setContent(pdfBlob.getDataAsString());
      } else {
        targetFolder.createFile(pdfBlob);
      }

      var drivePath = "DEVRIAN AGENCY / PRIVATE / CLIENTS / " + clientName + " / PAYMENTS / " + targetFolderName + " / " + fileName;

      return jsonResponse({
        success: true,
        message: "PDF uploaded successfully to: " + drivePath,
        path: drivePath
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
    service: "DEVRIAN Billing Studio - Advanced Agency Drive Sync",
    security: "PIN Protected",
    structure: "DEVRIAN AGENCY / PRIVATE / (DOCS + CLIENTS / [Client] / PAYMENTS)",
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
