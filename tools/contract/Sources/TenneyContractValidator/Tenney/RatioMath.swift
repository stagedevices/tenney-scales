import Foundation

public enum RatioMath {
  public static func reduce(_ numerator: Int, _ denominator: Int) -> (Int, Int) {
    let divisor = gcd(abs(numerator), abs(denominator))
    return (numerator / divisor, denominator / divisor)
  }

  private static func gcd(_ a: Int, _ b: Int) -> Int {
    var x = a
    var y = b
    while y != 0 {
      let temp = y
      y = x % y
      x = temp
    }
    return x
  }
}
