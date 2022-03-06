exports.prepareOutputFileName = (fileName) => {
  return fileName.split('.')[0] + '-with-watermark.' + fileName.split('.')[1];
};
