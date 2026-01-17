// swift-tools-version: 5.9
import PackageDescription

let package = Package(
  name: "TenneyContractValidator",
  platforms: [
    .macOS(.v13)
  ],
  products: [
    .executable(name: "TenneyContractValidator", targets: ["TenneyContractValidator"])
  ],
  targets: [
    .executableTarget(
      name: "TenneyContractValidator",
      path: "Sources/TenneyContractValidator"
    )
  ]
)
