import JSZip from "jszip";
import type { Conversation, Message } from "../types.js";
import { escapeHtml } from "./utils.js";
import { slugify } from "./utils.js";

function roleLabel(role: Message["role"]): string {
  switch (role) {
    case "user":
      return "You";
    case "assistant":
      return "Grok";
    case "system":
      return "System";
    case "tool":
      return "Tool";
    default:
      return "Other";
  }
}

function chapterHtml(conversation: Conversation, includeThoughts: boolean): string {
  const parts = conversation.messages
    .map((m) => {
      const thoughts =
        includeThoughts && m.thoughts.length
          ? `<div class="thoughts"><h3>Thoughts</h3>${m.thoughts
              .map((t) => `<p>${escapeHtml(t.text).replace(/\n/g, "<br/>")}</p>`)
              .join("")}</div>`
          : "";
      return `<section class="msg">
  <h2>${escapeHtml(roleLabel(m.role))}</h2>
  ${m.createdAt ? `<p class="time"><em>${escapeHtml(m.createdAt)}</em></p>` : ""}
  <p>${escapeHtml(m.content).replace(/\n/g, "<br/>")}</p>
  ${thoughts}
</section>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <title>${escapeHtml(conversation.title)}</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <h1>${escapeHtml(conversation.title)}</h1>
  ${parts}
  <p class="footer">Exported from Grok Backup Memory</p>
</body>
</html>`;
}

/**
 * Build a minimal EPUB 2.0 file (ZIP) suitable for Kindle-style readers.
 */
export async function toEpub(
  conversation: Conversation,
  options: { includeThoughts?: boolean } = {},
): Promise<Uint8Array> {
  const includeThoughts = options.includeThoughts !== false;
  const zip = new JSZip();
  const title = conversation.title || "Conversation";
  const bookId = `grok-memory-${conversation.id || slugify(title)}`;

  zip.file(
    "mimetype",
    "application/epub+zip",
    { compression: "STORE" },
  );

  zip.folder("META-INF")?.file(
    "container.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`,
  );

  const oebps = zip.folder("OEBPS");
  oebps?.file(
    "styles.css",
    `body { font-family: Georgia, serif; line-height: 1.5; margin: 1em; }
h1 { font-size: 1.4em; }
h2 { font-size: 1.1em; color: #6b5420; margin-top: 1.2em; }
.thoughts { font-size: 0.92em; color: #555; border-left: 2px solid #c4a574; padding-left: 0.75em; margin: 0.75em 0; }
.footer { color: #888; font-size: 0.85em; margin-top: 2em; }
.time { color: #888; font-size: 0.85em; }`,
  );

  oebps?.file("chapter1.xhtml", chapterHtml(conversation, includeThoughts));

  oebps?.file(
    "content.opf",
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>${escapeHtml(title)}</dc:title>
    <dc:language>en</dc:language>
    <dc:identifier id="BookId">${escapeHtml(bookId)}</dc:identifier>
    <dc:creator>Grok Backup Memory</dc:creator>
    <dc:publisher>Grok Backup Memory</dc:publisher>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="css" href="styles.css" media-type="text/css"/>
    <item id="chapter1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine toc="ncx">
    <itemref idref="chapter1"/>
  </spine>
</package>`,
  );

  oebps?.file(
    "toc.ncx",
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${escapeHtml(bookId)}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${escapeHtml(title)}</text></docTitle>
  <navMap>
    <navPoint id="navPoint-1" playOrder="1">
      <navLabel><text>${escapeHtml(title)}</text></navLabel>
      <content src="chapter1.xhtml"/>
    </navPoint>
  </navMap>
</ncx>`,
  );

  const blob = await zip.generateAsync({
    type: "uint8array",
    mimeType: "application/epub+zip",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
  return blob;
}
