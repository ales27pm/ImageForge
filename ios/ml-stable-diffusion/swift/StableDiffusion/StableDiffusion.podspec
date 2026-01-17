Pod::Spec.new do |spec|
  spec.name         = "StableDiffusion"
  spec.version      = "1.0.0"
  spec.summary      = "Stable Diffusion framework for image generation."
  spec.description  = <<-DESC
    StableDiffusion is a framework for generating images using Core ML.
  DESC
  spec.homepage     = "https://github.com/apple/ml-stable-diffusion"
  spec.license      = { :type => "MIT", :file => "LICENSE" }
  spec.author       = { "Apple" => "opensource@apple.com" }
  spec.source       = { :git => "https://github.com/apple/ml-stable-diffusion.git", :tag => "1.0.0" }

  spec.platform     = :ios, "14.0"
  spec.source_files = "pipeline/**/*.swift"
  spec.resources    = ["pipeline/placeholder.swift"]

  spec.frameworks   = "CoreML"
end