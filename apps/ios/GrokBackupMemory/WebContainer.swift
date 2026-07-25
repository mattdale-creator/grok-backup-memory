import SwiftUI
import WebKit

struct WebContainer: UIViewRepresentable {
    let url: URL
    var onReachability: (Bool) -> Void

    func makeCoordinator() -> Coordinator {
        Coordinator(onReachability: onReachability)
    }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 0.047, green: 0.059, blue: 0.051, alpha: 1)
        webView.scrollView.backgroundColor = webView.backgroundColor
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        context.coordinator.load(url, in: webView)
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        if context.coordinator.lastURL != url {
            context.coordinator.load(url, in: webView)
        }
    }

    final class Coordinator: NSObject, WKNavigationDelegate {
        var lastURL: URL?
        let onReachability: (Bool) -> Void

        init(onReachability: @escaping (Bool) -> Void) {
            self.onReachability = onReachability
        }

        func load(_ url: URL, in webView: WKWebView) {
            lastURL = url
            webView.load(URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 20))
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            onReachability(true)
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            onReachability(false)
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            onReachability(false)
        }
    }
}
