import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from 'uuid';
import { getReadingForMonth, saveReading, Reading } from '../models/readingModel';

const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY ?? '');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

export const uploadAndProcessReading = async (
  image: string,
  customerCode: string,
  measureDatetime: Date,
  measureType: string
): Promise<Reading> => {
  const month = measureDatetime.toISOString().slice(0, 7);

  const existingReading = getReadingForMonth(customerCode, measureType, month);
  if (existingReading) {
    throw new Error("DOUBLE_REPORT");
  }

  const uploadResponse = await fileManager.uploadFile(image, {
    mimeType: "image/jpeg",
    displayName: `${measureType} reading for ${customerCode}`,
  });

  const imageUrl = uploadResponse.file.uri;

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
  });

  const result = await model.generateContent([
    {
      fileData: {
        mimeType: "image/jpeg",
        fileUri: imageUrl,
      },
    },
    { text: "Extract the numeric value from this meter reading." },
  ]);

  const measureValue = parseInt(result.response.text(), 10);
  if (isNaN(measureValue)) {
    throw new Error('INVALID_MEASURE_VALUE');
  }

  const measureUuid = uuidv4();
  const newReading: Reading = {
    customerCode,
    measureType,
    month,
    measureValue,
    imageUrl,
    measureUuid
  };

  saveReading(newReading);

  return newReading;
};
