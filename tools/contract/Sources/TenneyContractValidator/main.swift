import Foundation

let fileManager = FileManager.default
let currentPath = fileManager.currentDirectoryPath
let packsPath = URL(fileURLWithPath: currentPath).appendingPathComponent("packs")

func findScaleBuilderFiles() throws -> [URL] {
  guard let enumerator = fileManager.enumerator(at: packsPath, includingPropertiesForKeys: nil) else {
    return []
  }
  var results: [URL] = []
  for case let fileURL as URL in enumerator {
    if fileURL.lastPathComponent == "scale-builder.json" && fileURL.path.contains("/tenney/") {
      results.append(fileURL)
    }
  }
  return results.sorted { $0.path < $1.path }
}

let decoder = JSONDecoder()
decoder.dateDecodingStrategy = .iso8601

var failures: [String] = []

do {
  let files = try findScaleBuilderFiles()
  for file in files {
    do {
      let data = try Data(contentsOf: file)
      _ = try decoder.decode(ScaleBuilderPayload.self, from: data)
    } catch {
      failures.append("Failed to decode \(file.path): \(error)")
    }
  }
} catch {
  failures.append("Failed to enumerate packs: \(error)")
}

if !failures.isEmpty {
  for failure in failures {
    fputs(failure + "\n", stderr)
  }
  exit(1)
}
