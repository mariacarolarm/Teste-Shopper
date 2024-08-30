import { Request, Response } from 'express';
import { uploadAndProcessReading } from '../services/readingService';

export const uploadReading = async (req: Request, res: Response): Promise<any> => {
  const { image, customer_code, measure_datetime, measure_type } = req.body;

  try {
    if (!image || !customer_code || !measure_datetime || !measure_type) {
      return res.status(400).json({
        error_code: "INVALID_DATA",
        error_description: "Missing required fields.",
      });
    }

    if (!['WATER', 'GAS'].includes(measure_type)) {
      return res.status(400).json({
        error_code: "INVALID_DATA",
        error_description: "measure_type must be 'WATER' or 'GAS'.",
      });
    }

    const measureDate = new Date(measure_datetime);
    if (isNaN(measureDate.getTime())) {
      return res.status(400).json({
        error_code: "INVALID_DATA",
        error_description: "Invalid date format for measure_datetime.",
      });
    }

    const reading = await uploadAndProcessReading(image, customer_code, measureDate, measure_type);

    return res.status(200).json({
      image_url: reading.imageUrl,
      measure_value: reading.measureValue,
      measure_uuid: reading.measureUuid,
    });

  } catch (error) {
    if ((error as Error).message === "DOUBLE_REPORT") {
      return res.status(409).json({
        error_code: "DOUBLE_REPORT",
        error_description: "Leitura do mês já realizada.",
      });
    } else if ((error as Error).message === 'INVALID_MEASURE_VALUE') {
      return res.status(500).json({
        error_code: "PROCESSING_ERROR",
        error_description: "An error occurred while extracting the measure value.",
      });
    } else {
      return res.status(500).json({
        error_code: "PROCESSING_ERROR",
        error_description: "An error occurred while processing the image.",
      });
    }
  }
};
