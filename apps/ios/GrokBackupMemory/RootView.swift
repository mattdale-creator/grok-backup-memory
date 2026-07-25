import SwiftUI

struct RootView: View {
    @EnvironmentObject private var appModel: AppModel
    @State private var showSettings = false

    var body: some View {
        ZStack {
            Color(red: 0.047, green: 0.059, blue: 0.051).ignoresSafeArea()

            switch appModel.destination {
            case .chooser:
                FirstRunView()
            case .library, .importPage:
                VStack(spacing: 0) {
                    chromeBar
                    if appModel.webReachable == false {
                        offlineBanner
                    }
                    WebContainer(
                        url: appModel.webURL(for: appModel.destination),
                        onReachability: { appModel.webReachable = $0 }
                    )
                }
            }
        }
        .preferredColorScheme(.dark)
        .sheet(isPresented: $showSettings) {
            SettingsSheet()
                .environmentObject(appModel)
        }
    }

    private var chromeBar: some View {
        HStack {
            Button {
                appModel.destination = .chooser
            } label: {
                HStack(spacing: 8) {
                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color(red: 0.91, green: 0.79, blue: 0.60),
                                    Color(red: 0.83, green: 0.71, blue: 0.51),
                                    Color(red: 0.16, green: 0.20, blue: 0.17),
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 28, height: 28)
                    Text("Grok Memory")
                        .font(.system(size: 17, weight: .semibold, design: .serif))
                        .foregroundStyle(Color(red: 0.93, green: 0.95, blue: 0.92))
                }
            }
            .buttonStyle(.plain)

            Spacer()

            Button("Import") { appModel.openImport() }
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(Color(red: 0.83, green: 0.71, blue: 0.51))

            Button("Library") { appModel.openLibrary() }
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(Color(red: 0.60, green: 0.64, blue: 0.59))

            Button {
                showSettings = true
            } label: {
                Image(systemName: "gearshape")
                    .foregroundStyle(Color(red: 0.60, green: 0.64, blue: 0.59))
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color(red: 0.047, green: 0.059, blue: 0.051).opacity(0.92))
    }

    private var offlineBanner: some View {
        Text("Can’t reach Grok Memory right now. Check the web address in settings, or open the site in your browser.")
            .font(.system(size: 13))
            .foregroundStyle(Color(red: 0.93, green: 0.95, blue: 0.92))
            .padding(12)
            .frame(maxWidth: .infinity)
            .background(Color(red: 0.35, green: 0.22, blue: 0.15))
    }
}

struct FirstRunView: View {
    @EnvironmentObject private var appModel: AppModel

    var body: some View {
        VStack(spacing: 28) {
            Spacer()
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [
                            Color(red: 0.91, green: 0.79, blue: 0.60),
                            Color(red: 0.83, green: 0.71, blue: 0.51),
                            Color(red: 0.16, green: 0.20, blue: 0.17),
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 88, height: 88)
                .shadow(color: .black.opacity(0.35), radius: 24, y: 12)

            VStack(spacing: 10) {
                Text("Grok Backup Memory")
                    .font(.system(size: 30, weight: .semibold, design: .serif))
                    .foregroundStyle(Color(red: 0.93, green: 0.95, blue: 0.92))
                Text("Import a file, or open your library.")
                    .font(.system(size: 16))
                    .foregroundStyle(Color(red: 0.60, green: 0.64, blue: 0.59))
                    .multilineTextAlignment(.center)
            }
            .padding(.horizontal, 28)

            VStack(spacing: 12) {
                Button {
                    appModel.openImport()
                } label: {
                    Text("Import")
                        .font(.system(size: 17, weight: .semibold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color(red: 0.83, green: 0.71, blue: 0.51))
                        .foregroundStyle(Color(red: 0.10, green: 0.08, blue: 0.05))
                        .clipShape(Capsule())
                }

                Button {
                    appModel.openLibrary()
                } label: {
                    Text("Open Library")
                        .font(.system(size: 17, weight: .semibold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color(red: 0.10, green: 0.13, blue: 0.11))
                        .foregroundStyle(Color(red: 0.93, green: 0.95, blue: 0.92))
                        .clipShape(Capsule())
                        .overlay(
                            Capsule().stroke(Color.white.opacity(0.12), lineWidth: 1)
                        )
                }
            }
            .padding(.horizontal, 28)

            Spacer()
            Text("Your data stays on this device in v1.")
                .font(.system(size: 13))
                .foregroundStyle(Color(red: 0.42, green: 0.45, blue: 0.41))
                .padding(.bottom, 28)
        }
    }
}

struct SettingsSheet: View {
    @EnvironmentObject private var appModel: AppModel
    @Environment(\.dismiss) private var dismiss
    @State private var baseURL: String = AppConfig.webBaseURL.absoluteString

    var body: some View {
        NavigationStack {
            Form {
                Section("Web app address") {
                    TextField("https://…", text: $baseURL)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                    Button("Save address") {
                        UserDefaults.standard.set(baseURL, forKey: "webBaseURL")
                        dismiss()
                    }
                }
                Section("About") {
                    Text("Grok Backup Memory loads the same calm library as the website. Share ZIP or JSON into this app anytime.")
                        .font(.footnote)
                }
            }
            .navigationTitle("Settings")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
        }
        .preferredColorScheme(.dark)
    }
}
