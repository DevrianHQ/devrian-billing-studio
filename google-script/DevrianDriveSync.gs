/**
 * DEVRIAN BILLING STUDIO - EXACT AGENCY FOLDER SYNC SCRIPT
 * ========================================================
 * Target Account: neelamrajput658@gmail.com
 *
 * EXACT FOLDER HIERARCHY:
 * 📁 DEVRIAN AGENCY
 *    └── 📁 PRIVATE
 *         ├── 📁 DOCS
 *         │    └── 📄 devrian_database.json (All studio data, dashboard, profile, clients)
 *         │
 *         └── 📁 CLIENTS
 *              └── 📁 [Client Name] (Automatic for every client)
 *                   └── 📁 PAYMENT
 *                        ├── 📁 INVOICE
 *                        ├── 📁 RECEIPT
 *                        └── 📁 PROPOSAL & QUOTATION
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
    var clientsFolder = getOrCreateSubFolder(privateFolder, "CLIENTS");

    // Helper to auto-create client template structure
    function setupClientFolders(cName) {
      if (!cName || !cName.trim() || cName.trim().toLowerCase() === "client name") {
        cName = "General Client";
      }
      var cFolder = getOrCreateSubFolder(clientsFolder, cName.trim());
      var payFolder = getOrCreateSubFolder(cFolder, "PAYMENT");
      var invFolder = getOrCreateSubFolder(payFolder, "INVOICE");
      var recFolder = getOrCreateSubFolder(payFolder, "RECEIPT");
      var propFolder = getOrCreateSubFolder(payFolder, "PROPOSAL & QUOTATION");

      return {
        clientFolder: cFolder,
        paymentFolder: payFolder,
        invoiceFolder: invFolder,
        receiptFolder: recFolder,
        proposalFolder: propFolder
      };
    }

    // 1. Connection Ping Test
    if (action === "ping") {
      return jsonResponse({
        success: true,
        message: "Connected to Google Drive! Structure: DEVRIAN AGENCY / PRIVATE / (DOCS + CLIENTS)",
        structure: "DEVRIAN AGENCY / PRIVATE / (DOCS + CLIENTS / [Client] / PAYMENT / (INVOICE, RECEIPT, PROPOSAL & QUOTATION))",
        email: Session.getActiveUser().getEmail() || "Authorized User"
      });
    }

    // 2. Sync Full Database -> Saved in PRIVATE/DOCS + Auto-creates folder templates for all clients!
    if (action === "syncDatabase") {
      var dbFile = getOrCreateFile(docsFolder, "devrian_database.json", "application/json");
      dbFile.setContent(JSON.stringify(data.payload, null, 2));

      // Auto-create folder tree for every client in the database
      var createdClients = [];
      if (data.payload && data.payload.clients && data.payload.clients.length > 0) {
        for (var i = 0; i < data.payload.clients.length; i++) {
          var cl = data.payload.clients[i];
          if (cl && cl.name) {
            setupClientFolders(cl.name);
            createdClients.push(cl.name);
          }
        }
      }

      // Also check documents for client names
      if (data.payload && data.payload.documents && data.payload.documents.length > 0) {
        for (var j = 0; j < data.payload.documents.length; j++) {
          var doc = data.payload.documents[j];
          if (doc && doc.clientName) {
            setupClientFolders(doc.clientName);
          }
        }
      }

      return jsonResponse({
        success: true,
        message: "Database synced to DEVRIAN AGENCY/PRIVATE/DOCS and all client folder templates created!",
        updatedAt: new Date().toISOString(),
        clientsConfigured: createdClients
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

    // 4. Upload PDF File -> Saved in PRIVATE/CLIENTS/[Client Name]/PAYMENT/(INVOICE | RECEIPT | PROPOSAL & QUOTATION)
    if (action === "uploadPdf") {
      var clientName = (data.clientName || "General Client").trim();
      var docType = (data.docType || "invoice").toLowerCase();
      var fileName = data.fileName || ("DEVRIAN_" + Date.now() + ".pdf");
      var base64Data = data.base64Pdf;

      if (!base64Data) {
        return jsonResponse({ success: false, error: "No PDF data provided" });
      }

      if (base64Data.indexOf(",") > -1) {
        base64Data = base64Data.split(",")[1];
      }

      // Create / Navigate client folder hierarchy
      var clientFolders = setupClientFolders(clientName);
      var targetFolder;
      var targetFolderName;

      if (docType === "receipt") {
        targetFolder = clientFolders.receiptFolder;
        targetFolderName = "RECEIPT";
      } else if (docType === "quotation" || docType === "proposal") {
        targetFolder = clientFolders.proposalFolder;
        targetFolderName = "PROPOSAL & QUOTATION";
      } else {
        targetFolder = clientFolders.invoiceFolder;
        targetFolderName = "INVOICE";
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

      var drivePath = "DEVRIAN AGENCY / PRIVATE / CLIENTS / " + clientName + " / PAYMENT / " + targetFolderName + " / " + fileName;

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
    service: "DEVRIAN Billing Studio - Exact Agency Drive Sync",
    security: "PIN Protected",
    structure: "DEVRIAN AGENCY / PRIVATE / (DOCS + CLIENTS / [Client] / PAYMENT / (INVOICE, RECEIPT, PROPOSAL & QUOTATION))",
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
