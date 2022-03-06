const fs = require('fs');
const Jimp = require('jimp');
const inquirer = require('inquirer');
const { prepareOutputFileName } = require('./utils');

const addTextWatermarkToImage = async function (inputFile, outputFile, text) {
  const image = await Jimp.read(inputFile);
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
  const textData = {
    text,
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
  };
  image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
  await image.quality(100).writeAsync(outputFile);
  process.stdout.write('Success!');
  startApp();
};

const addImageWatermarkToImage = async function (
  inputFile,
  outputFile,
  watermarkFile
) {
  const image = await Jimp.read(inputFile);
  const watermark = await Jimp.read(watermarkFile);
  const x = image.getWidth() / 2 - watermark.getWidth() / 2;
  const y = image.getHeight() / 2 - watermark.getHeight() / 2;
  image.composite(watermark, x, y, {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacitySource: 0.5,
  });
  await image.quality(100).writeAsync(outputFile);
  process.stdout.write('Success!');
  startApp();
};

const startApp = async () => {
  try {
    // Ask if user is ready
    const answer = await inquirer.prompt([
      {
        name: 'start',
        message:
          "Hi! Welcome to watermark manager. Copy your image files to `/img` folder. Then you'll be able to use them in the app. Are you ready?",
        type: 'confirm',
      },
    ]);
    // if the answer is no, exist the app
    if (!answer.start) process.exit();

    //ask about input file and type of watermark
    const options = await inquirer.prompt([
      {
        name: 'inputImage',
        message: 'What file would you like to process?',
        default: 'test.jpg',
      },
      {
        name: 'watermarkType',
        type: 'list',
        choices: ['Text watermark', 'Image watermark'],
      },
    ]);

    if (options.watermarkType === 'Text watermark') {
      const text = await inquirer.prompt([
        { name: 'value', type: 'input', message: 'Type your watermark text' },
      ]);
      options.watermarkText = text.value;
      if (fs.existsSync('./img/' + options.inputImage)) {
        addTextWatermarkToImage(
          './img/' + options.inputImage,
          `./${prepareOutputFileName(options.inputImage)}`,
          options.watermarkText
        );
      } else {
        process.stdout.write('Smth went wrong. Try again');
        process.exit();
      }
    } else {
      const image = await inquirer.prompt([
        {
          name: 'filename',
          type: 'input',
          message: 'Type your watermark name:',
          default: 'logo.png',
        },
      ]);
      options.watermarkImage = image.filename;
      if (
        fs.existsSync('./img/' + options.inputImage) &&
        fs.existsSync('./img/' + options.watermarkImage)
      ) {
        addImageWatermarkToImage(
          './img/' + options.inputImage,
          `./${prepareOutputFileName(options.inputImage)}`,
          './img/' + options.watermarkImage
        );
      } else {
        process.stdout.write('Smth went wrong. Try again');
        process.exit();
      }
    }
  } catch (err) {
    process.stdout.write('Smth went wrong. Try again');
    process.exit();
  }
};
startApp();
