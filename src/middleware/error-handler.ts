import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = async (
    err,
    req,
    res,
    next,
) => {
    let code = validHttpCode(err.code);

    let context = {
        error: err,
        error_code: err.code,
        request_headers: req.headers,
        request_body: req.body,
        request_params: req.params,
        request_query: req.query,
    };

    if (code >= 500) {
        console.error(context, err.message);
    } else {
        console.warn(context, err.message);
    }

    return res.status(code).json({
        error: code >= 500 ? "Internal Error" : err.message,
        context: err.context,
    });
};

function validHttpCode(code: any): number {
    return isNaN(code) || code >= 600 ? 500 : parseInt(code);
}
