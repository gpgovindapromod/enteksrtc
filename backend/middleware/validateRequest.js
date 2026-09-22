import { z } from 'zod';

export const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const message = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
                return res.status(400).json({
                    success: false,
                    message: `Validation Error - ${message}`
                });
            }
            next(error);
        }
    };
};
