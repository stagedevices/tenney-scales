import Foundation

public struct ScaleBuilderPayload: Codable {
  public enum Source: String, Codable {
    case lattice
    case library
    case tuner
    case manual
  }

  public let id: UUID
  public let source: Source
  public let title: String
  public let notes: String
  public let rootHz: Double
  public let primeLimit: Int
  public let refs: [RatioRef]
  public let axisShift: [Int: Int]
  public let autoplayAll: Bool
  public let startInLibrary: Bool
  public let existing: Int?
  public let stagingBaseCount: Int?
  public let createdAt: Date
  public let updatedAt: Date
}
