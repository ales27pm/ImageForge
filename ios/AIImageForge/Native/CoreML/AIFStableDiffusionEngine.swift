import Foundation
import CoreML
import UIKit
import StableDiffusion

@objcMembers
public final class AIFStableDiffusionEngine: NSObject {
  public static let shared = AIFStableDiffusionEngine()

  private var pipeline: StableDiffusionPipeline?
  private let workQueue = DispatchQueue(label: "aiimageforge.sd.queue", qos: .userInitiated)

  private override init() { super.init() }

  public func loadModel(modelDir: String) throws {
    let url = URL(fileURLWithPath: modelDir, isDirectory: true)

    let config = MLModelConfiguration()
    config.computeUnits = .cpuAndNeuralEngine

    let p = try StableDiffusionPipeline(
      resourcesAt: url,
      configuration: config,
      disableSafety: true,
      reduceMemory: true
    )

    try p.loadResources()
    self.pipeline = p
  }

  public func generate(
    prompt: String,
    stepCount: Int,
    seed: UInt32,
    guidanceScale: Float,
    progress: @escaping (_ step: Int, _ total: Int) -> Void,
    completion: @escaping (Result<URL, Error>) -> Void
  ) {
    guard let pipeline = self.pipeline else {
      completion(.failure(NSError(domain: "AIFStableDiffusionEngine", code: 1, userInfo: [
        NSLocalizedDescriptionKey: "Model not loaded"
      ])))
      return
    }

    workQueue.async {
      do {
        let total = max(1, stepCount)

        let images = try pipeline.generateImages(
          prompt: prompt,
          imageCount: 1,
          stepCount: total,
          seed: seed,
          guidanceScale: guidanceScale,
          disableSafety: true
        ) { prog in
          progress(prog.step, total)
          return true
        }

        guard let first = images.first else {
          throw NSError(domain: "AIFStableDiffusionEngine", code: 2, userInfo: [
            NSLocalizedDescriptionKey: "No image produced"
          ])
        }

        let cgImage: CGImage?
        if let i = first as? CGImage {
          cgImage = i
        } else if let i = first as? UIImage {
          cgImage = i.cgImage
        } else {
          cgImage = nil
        }

        guard let cg = cgImage else {
          throw NSError(domain: "AIFStableDiffusionEngine", code: 3, userInfo: [
            NSLocalizedDescriptionKey: "Unexpected image type from pipeline"
          ])
        }

        let uiImage = UIImage(cgImage: cg)
        guard let jpeg = uiImage.jpegData(compressionQuality: 0.92) else {
          throw NSError(domain: "AIFStableDiffusionEngine", code: 4, userInfo: [
            NSLocalizedDescriptionKey: "Failed to encode JPEG"
          ])
        }

        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        let outDir = docs.appendingPathComponent("aiimageforge", isDirectory: true)
        try FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)

        let outURL = outDir.appendingPathComponent("generated_\(seed).jpg")
        try jpeg.write(to: outURL, options: [.atomic])

        completion(.success(outURL))
      } catch {
        completion(.failure(error))
      }
    }
  }
}

@objc public extension AIFStableDiffusionEngine {
  // ObjC-friendly shim
  func generate(
    withPrompt prompt: String,
    stepCount: NSNumber,
    seed: NSNumber,
    guidanceScale: NSNumber,
    progress: @escaping (NSNumber, NSNumber) -> Void,
    completion: @escaping (URL?, NSError?) -> Void
  ) {
    let steps = max(1, stepCount.intValue)
    let s = seed.uint32Value
    let gs = guidanceScale.floatValue

    self.generate(
      prompt: prompt,
      stepCount: steps,
      seed: s,
      guidanceScale: gs,
      progress: { step, total in
        progress(NSNumber(value: step), NSNumber(value: total))
      },
      completion: { result in
        switch result {
        case .success(let url):
          completion(url, nil)
        case .failure(let err):
          completion(nil, err as NSError)
        }
      }
    )
  }
}