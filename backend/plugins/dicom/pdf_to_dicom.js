/**
 * PDF to DICOM Converter (Node.js)
 * Converts PDF pages to image-based DICOM files that can be opened in
 * Photoshop, medical DICOM viewers, and other standard imaging tools.
 *
 * Usage:
 *     node pdf_to_dicom.js input.pdf [output.dcm] [patientJSON]
 *
 * Examples:
 *     node pdf_to_dicom.js report.pdf
 *     node pdf_to_dicom.js report.pdf output.dcm
 *     node pdf_to_dicom.js report.pdf output.dcm '{"first_name":"John","last_name":"Doe","mr_number":"MR001","dob":"19900101","gender":"M"}'
 *
 * Patient JSON fields (all optional):
 *     id, study_id, p_code, mr_number, first_name, last_name, dob,
 *     gender, phone, email, address, city, state_id, zip, dos,
 *     referring_physician, note, diagnosis_status, medical_history
 *
 * Dependencies:
 *     npm install fs-extra pdfjs-dist@3.11.174 canvas
 */

const fs = require("fs-extra");
const path = require("path");
const crypto = require("crypto");
const { createCanvas } = require("canvas");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

// --- SOP Class UIDs ---
const SECONDARY_CAPTURE_SOP_CLASS = "1.2.840.10008.5.1.4.1.1.7"; // SC Image Storage
const EXPLICIT_VR_LITTLE_ENDIAN = "1.2.840.10008.1.2.1";
const IMPLEMENTATION_CLASS_UID_ROOT = "1.2.826.0.1.3680043.8.498.";

// --- UID Generation ---
function generateUID() {
    // Generate a DICOM-compliant UID (max 64 chars, digits and dots only)
    const root = "1.2.826.0.1.3680043.8.498.";
    const uniquePart = crypto.randomBytes(8).readBigUInt64BE().toString();
    const uid = root + uniquePart;
    return uid.substring(0, 64);
}

// --- Parse patient info from filename (fallback when no JSON provided) ---
function parsePatientInfoFromFilename(pdfPath) {
    const basename = path.basename(pdfPath, ".pdf");
    const match = basename.match(/^(.+?)_(\d+)$/);

    if (match) {
        return {
            name: match[1].replace(/_/g, "^"),
            id: match[2],
        };
    }

    return {
        name: basename.replace(/_/g, "^"),
        id: "UNKNOWN",
    };
}

/**
 * Convert a date/datetime string to DICOM DA format (YYYYMMDD).
 * Handles: "2026-04-09 11:35:59", "2026-04-09", "20260409", "04/09/2026"
 */
function toDicomDate(val) {
    if (!val) return "";
    const s = String(val).trim();
    // Already YYYYMMDD (8 digits)
    if (/^\d{8}$/.test(s)) return s;
    const d = new Date(s);
    if (isNaN(d.getTime())) return s.replace(/[-\/\s:]/g, "").substring(0, 8);
    return d.getFullYear().toString() +
        String(d.getMonth() + 1).padStart(2, "0") +
        String(d.getDate()).padStart(2, "0");
}

/**
 * Extract time from a datetime string to DICOM TM format (HHmmss.000000).
 * Returns "" if no time component found.
 */
function toDicomTime(val) {
    if (!val) return "";
    const s = String(val).trim();
    const match = s.match(/(\d{2}):(\d{2}):(\d{2})/);
    if (!match) return "";
    return match[1] + match[2] + match[3] + ".000000";
}

/**
 * Build patient metadata from JSON data + filename fallback.
 * Maps DB table columns to DICOM-compatible fields.
 */
function buildPatientMeta(pdfPath, jsonData) {
    const fallback = parsePatientInfoFromFilename(pdfPath);

    if (!jsonData || Object.keys(jsonData).length === 0) {
        return {
            patientName: fallback.name,
            patientId: fallback.id,
            patientDob: "",
            patientSex: "O",
            studyId: "1",
            studyInstanceUID: generateUID(),
            seriesInstanceUID: generateUID(),
			seriesDescription: "Orvos Report",
            accessionNumber: "",
            studyDate: "",
            studyTime: "",
            studyDescription: "Orvos Report",
            referringPhysician: "",
            additionalHistory: "",
            patientComments: "",
        };
    }

    const d = jsonData;

    // PatientName: DICOM format is LastName^FirstName
    let patientName = fallback.name;
    if (d.first_name || d.last_name) {
        const last = (d.last_name || "").trim();
        const first = (d.first_name || "").trim();
        patientName = last && first ? `${last}^${first}` : last || first;
    } else if (d.name) {
        patientName = String(d.name);
    }

    // PatientID: prefer mr_number, fall back to p_code, then id
    const patientId = String(d.mr_number || d.p_code || d.id || fallback.id);

    // DOB: convert any date format to DICOM YYYYMMDD
    const patientDob = toDicomDate(d.dob);

    // Gender: map to DICOM M/F/O
    let patientSex = "O";
    if (d.gender) {
        const g = String(d.gender).toUpperCase().charAt(0);
        if (g === "M" || g === "F") patientSex = g;
    }

    // StudyID from study_id
    const studyId = String(d.study_id || "1");
	
	// StudyInstanceUID from study_instance_uid
    const studyInstanceUID = String(d.study_instance_uid || generateUID());
	
	// SeriesInstanceUID from series_instance_uid
	const seriesInstanceUID = String(d.series_instance_uid || generateUID());
	
	// SeriesDescription from note
	const seriesDescription = String(d.note || '');

    // AccessionNumber from p_code or id
    const accessionNumber = String(d.p_code || d.id || "");

    // StudyDate + StudyTime from dos (date of service)
    const studyDate = toDicomDate(d.dos);
    const studyTime = toDicomTime(d.dos);

    // StudyDescription from study_description or default
    const studyDescription = String(d.study_description || "Orvos Report");

    // ReferringPhysician from referring_physician
    const referringPhysician = String(d.referring_physician || "");

    // AdditionalPatientHistory from medical_history
    const additionalHistory = String(d.medical_history || "");
	

    // PatientComments: combine useful context
    const commentParts = [];
    if (d.phone) commentParts.push(`Phone: ${d.phone}`);
    if (d.email) commentParts.push(`Email: ${d.email}`);
    if (d.address) {
        let addr = d.address;
        if (d.city) addr += `, ${d.city}`;
        if (d.state_id) addr += `, ${d.state_id}`;
        if (d.zip) addr += ` ${d.zip}`;
        commentParts.push(`Address: ${addr}`);
    }
    const patientComments = commentParts.join(" | ");

    return {
        patientName,
        patientId,
        patientDob,
        patientSex,
        studyId,
        studyInstanceUID,
        seriesInstanceUID,
		seriesDescription,
        accessionNumber,
        studyDate,
        studyTime,
        studyDescription,
        referringPhysician,
        additionalHistory,
        patientComments,
    };
}

// --- Custom Canvas Factory for Node.js ---
class NodeCanvasFactory {
    create(width, height) {
        const canvas = createCanvas(width, height);
        const context = canvas.getContext("2d");
        return { canvas, context };
    }

    reset(canvasAndContext, width, height) {
        canvasAndContext.canvas.width = width;
        canvasAndContext.canvas.height = height;
    }

    destroy(canvasAndContext) {
        canvasAndContext.canvas.width = 0;
        canvasAndContext.canvas.height = 0;
        canvasAndContext.canvas = null;
        canvasAndContext.context = null;
    }
}

// --- Convert PDF pages to RGB buffers ---
async function pdfPagesToImages(pdfPath, dpi = 300) {
    const canvasFactory = new NodeCanvasFactory();

    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const doc = await pdfjsLib.getDocument({
        data,
        canvasFactory,
    }).promise;

    const scale = dpi / 72.0;
    const pages = [];

    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
        const page = await doc.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        const canvasAndContext = canvasFactory.create(
            Math.floor(viewport.width),
            Math.floor(viewport.height)
        );
        const canvas = canvasAndContext.canvas;
        const ctx = canvasAndContext.context;

        // Fill white background (PDFs may have transparent backgrounds)
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
            canvasContext: ctx,
            canvasFactory,
            viewport,
        }).promise;

        // Get raw RGBA pixel data from canvas
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const rgba = imageData.data;

        // Convert RGBA to RGB (strip alpha channel)
        const pixelCount = canvas.width * canvas.height;
        const rgb = Buffer.alloc(pixelCount * 3);
        for (let i = 0; i < pixelCount; i++) {
            rgb[i * 3] = rgba[i * 4];     // R
            rgb[i * 3 + 1] = rgba[i * 4 + 1]; // G
            rgb[i * 3 + 2] = rgba[i * 4 + 2]; // B
        }

        pages.push({
            buffer: rgb,
            width: canvas.width,
            height: canvas.height,
        });

        console.log(`[INFO] Page ${pageNum}: ${canvas.width}x${canvas.height} px`);
    }

    return pages;
}

// ============================================================
// DICOM Part 10 Binary Writer
// ============================================================

/**
 * Pad a string to even length (DICOM requires even-length values).
 */
function padString(str) {
    if (str.length % 2 !== 0) {
        return str + " ";
    }
    return str;
}

/**
 * Pad a UI (UID) value to even length with null byte per DICOM spec.
 */
function padUID(str) {
    if (str.length % 2 !== 0) {
        return str + "\0";
    }
    return str;
}

/**
 * Write a DICOM tag element in Explicit VR Little Endian.
 *
 * Supports VRs: UI, LO, SH, CS, DA, TM, IS, US, UL, PN, OB, OW
 */
function writeDicomElement(group, element, vr, value) {
    const tagBuf = Buffer.alloc(4);
    tagBuf.writeUInt16LE(group, 0);
    tagBuf.writeUInt16LE(element, 2);

    const vrBuf = Buffer.from(vr, "ascii");

    // VRs that use 4-byte length (extended format)
    const extendedVRs = ["OB", "OW", "OF", "SQ", "UC", "UN", "UR", "UT"];

    if (vr === "US") {
        // Unsigned Short: 2 bytes
        const lenBuf = Buffer.alloc(2);
        lenBuf.writeUInt16LE(2, 0);
        const valBuf = Buffer.alloc(2);
        valBuf.writeUInt16LE(value, 0);
        return Buffer.concat([tagBuf, vrBuf, lenBuf, valBuf]);
    }

    if (vr === "UL") {
        // Unsigned Long: 4 bytes
        const lenBuf = Buffer.alloc(2);
        lenBuf.writeUInt16LE(4, 0);
        const valBuf = Buffer.alloc(4);
        valBuf.writeUInt32LE(value, 0);
        return Buffer.concat([tagBuf, vrBuf, lenBuf, valBuf]);
    }

    if (extendedVRs.includes(vr)) {
        // Extended VR: 2 bytes VR, 2 bytes reserved, 4 bytes length
        const reserved = Buffer.alloc(2, 0);
        const lenBuf = Buffer.alloc(4);

        if (Buffer.isBuffer(value)) {
            lenBuf.writeUInt32LE(value.length, 0);
            return Buffer.concat([tagBuf, vrBuf, reserved, lenBuf, value]);
        } else {
            const strVal = padString(String(value));
            const valBuf = Buffer.from(strVal, "ascii");
            lenBuf.writeUInt32LE(valBuf.length, 0);
            return Buffer.concat([tagBuf, vrBuf, reserved, lenBuf, valBuf]);
        }
    }

    // Standard VR: 2 bytes VR, 2 bytes length
    if (Buffer.isBuffer(value)) {
        const lenBuf = Buffer.alloc(2);
        lenBuf.writeUInt16LE(value.length, 0);
        return Buffer.concat([tagBuf, vrBuf, lenBuf, value]);
    }

    // For UI VR, pad with null byte instead of space
    let strVal;
    if (vr === "UI") {
        strVal = padUID(String(value));
    } else {
        strVal = padString(String(value));
    }
    const valBuf = Buffer.from(strVal, "ascii");
    const lenBuf = Buffer.alloc(2);
    lenBuf.writeUInt16LE(valBuf.length, 0);
    return Buffer.concat([tagBuf, vrBuf, lenBuf, valBuf]);
}

/**
 * Build a complete DICOM Part 10 file buffer.
 */
function buildDicomFile(options) {
    const {
        patientName,
        patientId,
        patientDob,
        patientSex,
        studyId,
        accessionNumber,
        studyDate,
        studyTime,
        studyDescription,
        referringPhysician,
		studyInstanceUID,
		seriesInstanceUID,
		seriesDescription,
        additionalHistory,
        patientComments,
        rows,
        cols,
        numberOfFrames,
        pixelData,
    } = options;

    const now = new Date();
    const dateStr = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0");
    const timeStr = String(now.getHours()).padStart(2, "0") +
        String(now.getMinutes()).padStart(2, "0") +
        String(now.getSeconds()).padStart(2, "0") + ".000000";

    const effectiveStudyDate = studyDate || dateStr;
    const effectiveStudyTime = studyTime || timeStr;

    const sopInstanceUID = generateUID();
    //const studyInstanceUID = generateUID();
    //const seriesInstanceUID = generateUID();
    const implementationClassUID = IMPLEMENTATION_CLASS_UID_ROOT + "1";

    // ---- Build File Meta Information (Group 0002) ----
    const metaElements = [];

    // (0002,0001) FileMetaInformationVersion
    metaElements.push(writeDicomElement(0x0002, 0x0001, "OB", Buffer.from([0x00, 0x01])));
    // (0002,0002) MediaStorageSOPClassUID
    metaElements.push(writeDicomElement(0x0002, 0x0002, "UI", SECONDARY_CAPTURE_SOP_CLASS));
    // (0002,0003) MediaStorageSOPInstanceUID
    metaElements.push(writeDicomElement(0x0002, 0x0003, "UI", sopInstanceUID));
    // (0002,0010) TransferSyntaxUID
    metaElements.push(writeDicomElement(0x0002, 0x0010, "UI", EXPLICIT_VR_LITTLE_ENDIAN));
    // (0002,0012) ImplementationClassUID
    metaElements.push(writeDicomElement(0x0002, 0x0012, "UI", implementationClassUID));
    // (0002,0013) ImplementationVersionName
    metaElements.push(writeDicomElement(0x0002, 0x0013, "SH", "PDF2DCM_JS"));

    const metaData = Buffer.concat(metaElements);

    // File Meta Information Group Length (0002,0000)
    const groupLengthElement = writeDicomElement(0x0002, 0x0000, "UL", metaData.length);

    // ---- 128 byte preamble + "DICM" magic ----
    const preamble = Buffer.alloc(128, 0);
    const magic = Buffer.from("DICM", "ascii");

    // ---- Build Dataset (Groups > 0002) ----
    const dataElements = [];

    // --- Specific Character Set ---
    // (0008,0005) SpecificCharacterSet
    dataElements.push(writeDicomElement(0x0008, 0x0005, "CS", "ISO_IR 100"));

    // --- IMAGE TYPE ---
    // (0008,0008) ImageType
    dataElements.push(writeDicomElement(0x0008, 0x0008, "CS", "DERIVED\\SECONDARY"));

    // --- DATE/TIME ---
    // (0008,0012) InstanceCreationDate
    dataElements.push(writeDicomElement(0x0008, 0x0012, "DA", dateStr));
    // (0008,0013) InstanceCreationTime
    dataElements.push(writeDicomElement(0x0008, 0x0013, "TM", timeStr));
    // (0008,0016) SOPClassUID
    dataElements.push(writeDicomElement(0x0008, 0x0016, "UI", SECONDARY_CAPTURE_SOP_CLASS));
    // (0008,0018) SOPInstanceUID
    dataElements.push(writeDicomElement(0x0008, 0x0018, "UI", sopInstanceUID));

    // --- STUDY ---
    // (0008,0020) StudyDate
    dataElements.push(writeDicomElement(0x0008, 0x0020, "DA", effectiveStudyDate));
    // (0008,0030) StudyTime
    dataElements.push(writeDicomElement(0x0008, 0x0030, "TM", effectiveStudyTime));
    // (0008,0050) AccessionNumber
    dataElements.push(writeDicomElement(0x0008, 0x0050, "SH", accessionNumber || ""));
    // (0008,0060) Modality
    dataElements.push(writeDicomElement(0x0008, 0x0060, "CS", "OT"));
    // (0008,0064) ConversionType
    dataElements.push(writeDicomElement(0x0008, 0x0064, "CS", "WSD"));
    // (0008,0070) Manufacturer
    dataElements.push(writeDicomElement(0x0008, 0x0070, "LO", "PDF2DICOM"));
    // (0008,0090) ReferringPhysicianName
    dataElements.push(writeDicomElement(0x0008, 0x0090, "PN", referringPhysician || ""));
    // (0008,1030) StudyDescription
    dataElements.push(writeDicomElement(0x0008, 0x1030, "LO", studyDescription || "Orvos Report"));
    // (0008,1090) ManufacturerModelName
    dataElements.push(writeDicomElement(0x0008, 0x1090, "LO", "Orvos"));

    // --- PATIENT ---
    // (0010,0010) PatientName
    dataElements.push(writeDicomElement(0x0010, 0x0010, "PN", patientName));
    // (0010,0020) PatientID
    dataElements.push(writeDicomElement(0x0010, 0x0020, "LO", patientId));
    // (0010,0030) PatientBirthDate
    dataElements.push(writeDicomElement(0x0010, 0x0030, "DA", patientDob || ""));
    // (0010,0040) PatientSex
    dataElements.push(writeDicomElement(0x0010, 0x0040, "CS", patientSex || "O"));
    // (0010,21B0) AdditionalPatientHistory
    if (additionalHistory) {
        dataElements.push(writeDicomElement(0x0010, 0x21B0, "LO", additionalHistory.substring(0, 64)));
    }
    // (0010,4000) PatientComments
    if (patientComments) {
        dataElements.push(writeDicomElement(0x0010, 0x4000, "LO", patientComments.substring(0, 64)));
    }

    // --- SOFTWARE ---
    // (0018,1020) SoftwareVersions
    dataElements.push(writeDicomElement(0x0018, 0x1020, "LO", "1.0"));

    // --- GENERAL STUDY / SERIES ---
    // (0020,000D) StudyInstanceUID
    dataElements.push(writeDicomElement(0x0020, 0x000D, "UI", studyInstanceUID));
    // (0020,000E) SeriesInstanceUID
    dataElements.push(writeDicomElement(0x0020, 0x000E, "UI", seriesInstanceUID));
	
	 // (0x0008,0x103E) SeriesDescription
	dataElements.push(writeDicomElement(0x0008, 0x103E, "LO", seriesDescription));
	
    // (0020,0010) StudyID
    dataElements.push(writeDicomElement(0x0020, 0x0010, "SH", studyId || "1"));
    // (0020,0011) SeriesNumber
    dataElements.push(writeDicomElement(0x0020, 0x0011, "IS", "1"));
    // (0020,0013) InstanceNumber
    dataElements.push(writeDicomElement(0x0020, 0x0013, "IS", "1"));

    // --- IMAGE PIXEL MODULE ---
    // (0028,0002) SamplesPerPixel
    dataElements.push(writeDicomElement(0x0028, 0x0002, "US", 3));
    // (0028,0004) PhotometricInterpretation
    dataElements.push(writeDicomElement(0x0028, 0x0004, "CS", "RGB"));
    // (0028,0006) PlanarConfiguration
    dataElements.push(writeDicomElement(0x0028, 0x0006, "US", 0));
    // (0028,0008) NumberOfFrames
    dataElements.push(writeDicomElement(0x0028, 0x0008, "IS", String(numberOfFrames)));
    // (0028,0010) Rows
    dataElements.push(writeDicomElement(0x0028, 0x0010, "US", rows));
    // (0028,0011) Columns
    dataElements.push(writeDicomElement(0x0028, 0x0011, "US", cols));
    // (0028,0100) BitsAllocated
    dataElements.push(writeDicomElement(0x0028, 0x0100, "US", 8));
    // (0028,0101) BitsStored
    dataElements.push(writeDicomElement(0x0028, 0x0101, "US", 8));
    // (0028,0102) HighBit
    dataElements.push(writeDicomElement(0x0028, 0x0102, "US", 7));
    // (0028,0103) PixelRepresentation
    dataElements.push(writeDicomElement(0x0028, 0x0103, "US", 0));

    // --- EXTRA ---
    // (0028,0301) BurnedInAnnotation
    dataElements.push(writeDicomElement(0x0028, 0x0301, "CS", "YES"));
    // (0028,2110) LossyImageCompression
    dataElements.push(writeDicomElement(0x0028, 0x2110, "CS", "00"));

    // --- SERIES DESCRIPTION (must come after 0028 group for tag ordering) ---
    // Actually in DICOM, (0008,103E) belongs to group 0008 - we placed it above.
    // Pixel data must be last.

    // --- PIXEL DATA ---
    // (7FE0,0010) PixelData - use OW VR
    dataElements.push(writeDicomElement(0x7FE0, 0x0010, "OW", pixelData));

    const dataset = Buffer.concat(dataElements);

    // ---- Assemble final DICOM file ----
    return Buffer.concat([
        preamble,           // 128 bytes of zeros
        magic,              // 4 bytes "DICM"
        groupLengthElement, // (0002,0000) UL - meta group length
        metaData,           // All group 0002 elements
        dataset,            // All data elements + pixel data
    ]);
}

// ============================================================
// Main conversion function
// ============================================================

async function pdfToDicom(pdfPath, outputDcm, patientJson) {
    pdfPath = path.resolve(pdfPath);
    outputDcm = path.resolve(outputDcm);

    console.log(`[INFO] Input PDF : ${pdfPath}`);
    console.log(`[INFO] Output DCM: ${outputDcm}`);

    if (!fs.existsSync(pdfPath)) {
        console.error(`[ERROR] PDF not found: ${pdfPath}`);
        process.exit(1);
    }

    // Build patient metadata from JSON (if provided) or filename fallback
    const meta = buildPatientMeta(pdfPath, patientJson);
    console.log(`[INFO] Patient   : ${meta.patientName} | ID: ${meta.patientId}`);
    if (meta.patientDob) console.log(`[INFO] DOB       : ${meta.patientDob}`);
    if (meta.studyDate) console.log(`[INFO] Study Date: ${meta.studyDate}`);

    // --- Rasterize PDF pages ---
    console.log("[INFO] Rasterizing PDF pages at 300 DPI ...");
    const pages = await pdfPagesToImages(pdfPath, 300);

    if (pages.length === 0) {
        console.error("[ERROR] No pages found in PDF!");
        process.exit(1);
    }

    // Use first page dimensions as reference
    const firstPage = pages[0];
    const rows = firstPage.height;
    const cols = firstPage.width;

    // --- Build pixel data ---
    const frames = [];

    for (let i = 0; i < pages.length; i++) {
        let frameBuffer = pages[i].buffer;
        frames.push(frameBuffer);

        if (pages.length === 1) {
            console.log(`[INFO] Single frame: ${cols}x${rows} RGB`);
        } else {
            console.log(`[INFO] Frame ${i + 1}/${pages.length} added`);
        }
    }

    const pixelData = Buffer.concat(frames);

    if (pages.length > 1) {
        console.log(`[INFO] Multi-frame: ${pages.length} frames, ${cols}x${rows} RGB`);
    }

    // --- Build DICOM file ---
    const dicomBuffer = buildDicomFile({
        ...meta,
        rows,
        cols,
        numberOfFrames: pages.length,
        pixelData,
    });

    // Ensure output directory exists
    const outDir = path.dirname(outputDcm);
    if (outDir) {
        fs.ensureDirSync(outDir);
    }

    // Write DICOM file
    fs.writeFileSync(outputDcm, dicomBuffer);

    // Verify
    if (fs.existsSync(outputDcm)) {
        const fileSize = fs.statSync(outputDcm).size;
        const sizeMB = (fileSize / (1024 * 1024)).toFixed(1);
        console.log(`[OK] DICOM created: ${outputDcm} (${sizeMB} MB)`);
        console.log(`[OK] Patient: ${meta.patientName} | ID: ${meta.patientId} | Sex: ${meta.patientSex}`);
        console.log(`[OK] Frames: ${pages.length} | Size: ${cols}x${rows} | RGB 8-bit`);
    } else {
        console.error("[ERROR] Failed to create DICOM file!");
        process.exit(1);
    }
}

// ============================================================
// CLI Entry Point
// ============================================================

(async () => {
    if (process.argv.length < 3) {
        console.log("Usage: node pdf_to_dicom.js input.pdf [output.dcm] [patientJSON]");
        console.log("");
        console.log("  Converts PDF pages to image-based DICOM file.");
        console.log("  Patient data can be passed as a JSON string (optional).");
        console.log("");
        console.log("Examples:");
        console.log('  node pdf_to_dicom.js report.pdf');
        console.log('  node pdf_to_dicom.js report.pdf files/out.dcm');
        console.log('  node pdf_to_dicom.js report.pdf files/out.dcm \'{"first_name":"John","last_name":"Doe","mr_number":"MR001","dob":"19900101","gender":"M"}\'');
        process.exit(1);
    }

    const pdfPath = process.argv[2];

    if (!fs.existsSync(pdfPath)) {
        console.error("[ERROR] File not found: " + pdfPath);
        process.exit(1);
    }

    const basename = path.basename(pdfPath, ".pdf") + ".dcm";
    const outputDcm = process.argv[3] || path.join("files", basename);

    // Parse optional patient data (3rd or 4th arg) — accepts raw JSON or base64-encoded JSON
    let patientJson = null;
    const dataArg = process.argv[4] || process.argv[3];

    if (dataArg && dataArg !== outputDcm) {
        try {
            const decoded = dataArg.trim().startsWith("{")
                ? dataArg
                : Buffer.from(dataArg, "base64").toString("utf-8");
            patientJson = JSON.parse(decoded);
        } catch (e) {
            console.error("[WARN] Invalid patient data, ignoring: " + e.message);
            patientJson = null;
        }
    }

    await pdfToDicom(pdfPath, outputDcm, patientJson);
})();