import Foundation

enum AppConfig {
    /// Web app origin. Simulator → host machine localhost.
    /// Change to your production HTTPS URL before release.
    static var webBaseURL: URL {
        if let override = UserDefaults.standard.string(forKey: "webBaseURL"),
           let url = URL(string: override),
           !override.isEmpty {
            return url
        }
        #if targetEnvironment(simulator)
        return URL(string: "http://127.0.0.1:3000")!
        #else
        // Device on same LAN: replace with your Mac IP or production domain.
        return URL(string: "http://127.0.0.1:3000")!
        #endif
    }

    static let appGroupId = "group.com.example.GrokBackupMemory"
    static let sharedInboxFileName = "shared-import"
    static let urlScheme = "grokmemory"
}
