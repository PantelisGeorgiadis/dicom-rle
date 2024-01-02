const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { BannerPlugin } = require('webpack');
const pkg = require('./package.json');

const rootPath = process.cwd();
const context = path.join(rootPath, 'src');
const outputPath = path.join(rootPath, 'build');
const filename = path.parse(pkg.main).base;

const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = ('0' + (today.getMonth() + 1)).slice(-2);
  const date = ('0' + today.getDate()).slice(-2);
  return `${year}-${month}-${date}`;
};

const getBanner = () => {
  return (
    `/*! ${pkg.name} - ${pkg.version} - ` +
    `${getCurrentDate()} ` +
    `| (c) 2022-2024 ${pkg.author} | ${pkg.homepage} */`
  );
};

module.exports = {
  mode: 'production',
  context,
  entry: {
    dicomRle: './index.js',
  },
  target: 'web',
  output: {
    filename,
    library: {
      commonjs: 'dicom-rle',
      amd: 'dicom-rle',
      root: 'dicomRle',
    },
    libraryTarget: 'umd',
    path: outputPath,
    umdNamedDefine: true,
    globalObject: 'this',
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        parallel: true,
        terserOptions: {
          sourceMap: true,
        },
      }),
    ],
  },
  plugins: [
    new BannerPlugin({
      banner: getBanner(),
      entryOnly: true,
      raw: true,
    }),
  ],
};
