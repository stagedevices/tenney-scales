import Foundation

public struct TenneyScale: Codable, Hashable {
  public let id: UUID
  public let title: String
  public let refs: [RatioRef]
}
