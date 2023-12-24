import { Request, Response, NextFunction } from 'express';
import { logger } from '.././config/logger';
import { v4 as uuidv4 } from 'uuid';

const addRequestId = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const requestId = uuidv4(); // Generate a UUID
    logger.addContext('request-id', requestId);


    next();
}

export { addRequestId };
