import Foundation

public struct RatioRef: Codable, Hashable {
  public let p: Int
  public let q: Int
  public let octave: Int
  public let monzo: [Int: Int]
}
