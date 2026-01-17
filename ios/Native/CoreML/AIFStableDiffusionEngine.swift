import CoreML
import Foundation

@available(iOS 15.0, *)
class AIFStableDiffusionEngine {
    private let pipeline: StableDiffusionPipeline

    init(modelURL: URL) throws {
        let configuration = MLModelConfiguration()
        configuration.computeUnits = .cpuAndNeuralEngine
        self.pipeline = try StableDiffusionPipeline(modelURL: modelURL, configuration: configuration)
    }

    func generateImage(prompt: String, seed: Int, stepCount: Int, guidanceScale: Float, width: Int, height: Int, progressHandler: @escaping (Float) -> Void) throws -> URL {
        let outputURL = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString + ".jpg")

        try self.pipeline.generateImage(
            prompt: prompt,
            seed: seed,
            stepCount: stepCount,
            guidanceScale: guidanceScale,
            width: width,
            height: height,
            progressHandler: progressHandler
        ).write(to: outputURL, options: .atomic)

        return outputURL
    }
}