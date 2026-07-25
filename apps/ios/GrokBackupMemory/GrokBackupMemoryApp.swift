import SwiftUI

@main
struct GrokBackupMemoryApp: App {
    @StateObject private var appModel = AppModel()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(appModel)
                .onOpenURL { url in
                    appModel.handleIncomingURL(url)
                }
        }
    }
}

@MainActor
final class AppModel: ObservableObject {
    enum Destination: Equatable {
        case chooser
        case library
        case importPage
    }

    @Published var destination: Destination = .chooser
    @Published var pendingImportURL: URL?
    @Published var webReachable: Bool? = nil

    func openLibrary() { destination = .library }
    func openImport() { destination = .importPage }

    func handleIncomingURL(_ url: URL) {
        // grokmemory://import or file:// shared documents
        if url.scheme == AppConfig.urlScheme {
            consumeAppGroupInbox()
            destination = .importPage
            return
        }
        if url.isFileURL {
            pendingImportURL = url
            destination = .importPage
        }
    }

    func consumeAppGroupInbox() {
        guard let container = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: AppConfig.appGroupId
        ) else { return }

        let inbox = container.appendingPathComponent("Inbox", isDirectory: true)
        guard let files = try? FileManager.default.contentsOfDirectory(
            at: inbox,
            includingPropertiesForKeys: [.contentModificationDateKey],
            options: [.skipsHiddenFiles]
        ), let latest = files.sorted(by: {
            let d0 = (try? $0.resourceValues(forKeys: [.contentModificationDateKey]).contentModificationDate) ?? .distantPast
            let d1 = (try? $1.resourceValues(forKeys: [.contentModificationDateKey]).contentModificationDate) ?? .distantPast
            return d0 > d1
        }).first else { return }

        let dest = FileManager.default.temporaryDirectory
            .appendingPathComponent(latest.lastPathComponent)
        try? FileManager.default.removeItem(at: dest)
        try? FileManager.default.copyItem(at: latest, to: dest)
        pendingImportURL = dest
    }

    func webURL(for destination: Destination) -> URL {
        switch destination {
        case .chooser, .library:
            return AppConfig.webBaseURL.appendingPathComponent("library")
        case .importPage:
            return AppConfig.webBaseURL.appendingPathComponent("import")
        }
    }
}
