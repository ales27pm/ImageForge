import Foundation
import StableDiffusion

class StableDiffusionIntegration {
    private var pipeline: StableDiffusionPipeline?

    init() {
        setupPipeline()
    }

    private func setupPipeline() {
        do {
            let configuration = StableDiffusionPipeline.Configuration(
                resourcesAt: Bundle.main.resourceURL!,
                computeUnits: .all
            )
            pipeline = try StableDiffusionPipeline(configuration: configuration)
            print("StableDiffusionPipeline initialized successfully.")
        } catch {
            print("Failed to initialize StableDiffusionPipeline: \(error)")
        }
    }

    func generateImage(prompt: String, completion: @escaping (CGImage?) -> Void) {
        guard let pipeline = pipeline else {
            print("Pipeline is not initialized.")
            completion(nil)
            return
        }

        let request = StableDiffusionPipeline.Request(
            prompt: prompt,
            imageCount: 1
        )

        pipeline.generateImages(requests: [request]) { result in
            switch result {
            case .success(let images):
                completion(images.first)
            case .failure(let error):
                print("Image generation failed: \(error)")
                completion(nil)
            }
        }
    }
}