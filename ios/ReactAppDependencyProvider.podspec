Pod::Spec.new do |spec|
  spec.name         = "ReactAppDependencyProvider"
  spec.version      = "1.0.0"
  spec.summary      = "Provides dependencies for React Native apps."
  spec.description  = <<-DESC
    ReactAppDependencyProvider is a helper podspec for managing dependencies in React Native projects.
  DESC
  spec.homepage     = "https://github.com/facebook/react-native"
  spec.license      = { :type => "MIT" }
  spec.author       = { "Facebook" => "opensource@fb.com" }
  spec.source       = { :git => "https://github.com/facebook/react-native.git", :tag => "v1.0.0" }

  spec.platform     = :ios, "11.0"
  spec.source_files = "**/*.{h,m,swift}"
  spec.dependency   'React-Core'
end