const Joi = require("joi");

class CartValidator {
  static validateCart = Joi.object({
    USER_ID: Joi.string().required().messages({
      "string.base": `"USER_ID" phải là một chuỗi`,
      "any.required": `"USER_ID" là trường bắt buộc`,
    }),
    LIST_TOUR_REF: Joi.array()
      .items(
        Joi.object({
          TOUR_ID: Joi.string().required().messages({
            "string.base": `"TOUR_ID" phải là một chuỗi`,
            "any.required": `"TOUR_ID" là trường bắt buộc`,
          }),
          START_DATE: Joi.date().required().messages({
            "date.base": `"START_DATE" phải là một ngày hợp lệ`,
            "any.required": `"START_DATE" là trường bắt buộc`,
          }),
          END_DATE: Joi.date().required().messages({
            "date.base": `"END_DATE" phải là một ngày hợp lệ`,
            "any.required": `"END_DATE" là trường bắt buộc`,
          }),
        })
      )
      .required()
      .messages({
        "array.base": `"LIST_TOUR_REF" phải là một mảng`,
        "any.required": `"LIST_TOUR_REF" là trường bắt buộc`,
      }),
  });

  static validate(data) {
    const { error, value } = this.validateCart.validate(data);
    if (error) {
      throw new Error(
        `Validation Error: ${error.details.map((x) => x.message).join(", ")}`
      );
    }
    return value;
  }
}

module.exports = CartValidator;
