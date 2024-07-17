import { ErrorRequestHandler, NextFunction, Request, Response } from "express"
import { logger } from "../startup/logger"

export const error = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message)
    res.status(500).send("Something failed")
}