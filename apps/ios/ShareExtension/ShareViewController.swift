import UIKit
import UniformTypeIdentifiers

/// Share Extension: accepts ZIP/JSON, copies into App Group inbox, opens main app.
class ShareViewController: UIViewController {
    private let appGroupId = "group.com.example.GrokBackupMemory"

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        view.backgroundColor = UIColor(red: 0.047, green: 0.059, blue: 0.051, alpha: 1)
        Task { await handleShare() }
    }

    private func handleShare() async {
        guard let items = extensionContext?.inputItems as? [NSExtensionItem] else {
            complete(); return
        }

        for item in items {
            guard let attachments = item.attachments else { continue }
            for provider in attachments {
                if provider.hasItemConformingToTypeIdentifier(UTType.zip.identifier) {
                    await saveProvider(provider, type: UTType.zip.identifier, ext: "zip")
                    openApp(); return
                }
                if provider.hasItemConformingToTypeIdentifier(UTType.json.identifier) {
                    await saveProvider(provider, type: UTType.json.identifier, ext: "json")
                    openApp(); return
                }
                if provider.hasItemConformingToTypeIdentifier(UTType.data.identifier) {
                    await saveProvider(provider, type: UTType.data.identifier, ext: "bin")
                    openApp(); return
                }
            }
        }
        complete()
    }

    private func saveProvider(_ provider: NSItemProvider, type: String, ext: String) async {
        await withCheckedContinuation { (cont: CheckedContinuation<Void, Never>) in
            provider.loadItem(forTypeIdentifier: type, options: nil) { item, _ in
                defer { cont.resume() }
                let data: Data?
                var name = "import.\(ext)"
                if let url = item as? URL {
                    name = url.lastPathComponent
                    data = try? Data(contentsOf: url)
                } else if let d = item as? Data {
                    data = d
                } else {
                    data = nil
                }
                guard let data else { return }
                self.writeToInbox(data: data, fileName: name)
            }
        }
    }

    private func writeToInbox(data: Data, fileName: String) {
        guard let container = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: appGroupId
        ) else { return }
        let inbox = container.appendingPathComponent("Inbox", isDirectory: true)
        try? FileManager.default.createDirectory(at: inbox, withIntermediateDirectories: true)
        let dest = inbox.appendingPathComponent(fileName)
        try? data.write(to: dest, options: .atomic)
    }

    private func openApp() {
        // Prefer extensionContext open for host app URL scheme
        let url = URL(string: "grokmemory://import")!
        var responder: UIResponder? = self
        while let r = responder {
            if let application = r as? UIApplication {
                application.open(url, options: [:], completionHandler: { _ in
                    self.complete()
                })
                return
            }
            responder = r.next
        }
        // Fallback: open via extension context (iOS 18+ patterns vary)
        complete()
    }

    private func complete() {
        extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
    }
}
