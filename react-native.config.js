module.exports = {
  dependencies: {},
  project: {
    ios: {
      sourceDir: './ios',
    },
    android: {
      sourceDir: './android',
    },
  },
  reactNative: {
    codegenConfig: {
      name: 'FBReactNativeSpec',
      jsSrcsDir: './node_modules/react-native/Libraries',
      android: {
        packageInstance: 'new FBReactNativeSpecPackage()'
      },
      ios: {
        podspecPath: './node_modules/react-native/React/FBReactNativeSpec/FBReactNativeSpec.podspec'
      }
    },
    customCodegen: {
      name: 'MetalImageViewNative',
      jsSrcsDir: './client/native',
      android: {
        packageInstance: 'new MetalImageViewPackage()'
      },
      ios: {
        podspecPath: './client/native/MetalImageViewNative.podspec'
      }
    }
  }
};