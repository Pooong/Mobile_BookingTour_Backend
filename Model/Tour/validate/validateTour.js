const Joi = require("joi");

class TourValidator {
  static validateTour = Joi.object({
    TOUR_NAME: Joi.string().required().messages({
      "string.base": `"TOUR_NAME" phải là một chuỗi`,
      "string.empty": `"TOUR_NAME" không được để trống`,
      "any.required": `"TOUR_NAME" là trường bắt buộc`,
    }),
    TYPE: Joi.string()
      .valid("Mountain", "Sea", "City", "Cruise")
      .required()
      .messages({
        "string.base": `"TYPE" phải là một chuỗi`,
        "any.only": `"TYPE" phải là một trong các giá trị: ['Mountain', 'Sea', 'City', 'Cruise']`,
        "any.required": `"TYPE" là trường bắt buộc`,
      }),
    PRICE_PER_PERSON: Joi.number().positive().required().messages({
      "number.base": `"PRICE_PER_PERSON" phải là một số`,
      "number.positive": `"PRICE_PER_PERSON" phải là số dương`,
      "any.required": `"PRICE_PER_PERSON" là trường bắt buộc`,
    }),
    DESCRIPTION: Joi.string().optional().allow("").messages({
      "string.base": `"DESCRIPTION" phải là một chuỗi`,
    }),
    IMAGES: Joi.array()
      .items(Joi.string().uri().required())
      .optional()
      .messages({
        "array.base": `"IMAGES" phải là một mảng`,
        "string.base": `"IMAGES" chứa các giá trị phải là chuỗi`,
        "string.uri": `"IMAGES" chứa các giá trị phải là URL hợp lệ`,
      }),
    AVAILABILITY: Joi.array()
      .items(
        Joi.object({
          DATE: Joi.date().required().messages({
            "date.base": `"DATE" phải là một ngày hợp lệ`,
            "any.required": `"DATE" là trường bắt buộc`,
          }),
          AVAILABLE_SLOTS: Joi.number()
            .integer()
            .positive()
            .required()
            .messages({
              "number.base": `"AVAILABLE_SLOTS" phải là một số`,
              "number.integer": `"AVAILABLE_SLOTS" phải là số nguyên`,
              "number.positive": `"AVAILABLE_SLOTS" phải là số dương`,
              "any.required": `"AVAILABLE_SLOTS" là trường bắt buộc`,
            }),
        })
      )
      .optional()
      .messages({
        "array.base": `"AVAILABILITY" phải là một mảng`,
      }),
    CUSTOM_ATTRIBUTES: Joi.object()
      .pattern(
        Joi.string(),
        Joi.alternatives().try(
          Joi.string().messages({
            "string.base": `"CUSTOM_ATTRIBUTE" phải là một chuỗi`,
          }),
          Joi.number().messages({
            "number.base": `"CUSTOM_ATTRIBUTE" phải là một số`,
          }),
          Joi.boolean().messages({
            "boolean.base": `"CUSTOM_ATTRIBUTE" phải là một giá trị boolean`,
          }),
          Joi.array().messages({
            "array.base": `"CUSTOM_ATTRIBUTE" phải là một mảng`,
          }),
          Joi.object().messages({
            "object.base": `"CUSTOM_ATTRIBUTE" phải là một đối tượng`,
          })
        )
      )
      .optional()
      .messages({
        "object.base": `"CUSTOM_ATTRIBUTES" phải là một đối tượng`,
      }),
    DEPOSIT_PERCENTAGE: Joi.number().min(0).max(100).required().messages({
      "number.base": `"DEPOSIT_PERCENTAGE" phải là một số`,
      "number.min": `"DEPOSIT_PERCENTAGE" phải nằm trong khoảng từ 0 đến 100`,
      "number.max": `"DEPOSIT_PERCENTAGE" phải nằm trong khoảng từ 0 đến 100`,
      "any.required": `"DEPOSIT_PERCENTAGE" là trường bắt buộc`,
    }),
  });

  static validate(data) {
    const { error, value } = this.validateTour.validate(data);
    if (error) {
      throw new Error(
        `Validation Error: ${error.details.map((x) => x.message).join(", ")}`
      );
    }
    return value;
  }
}

module.exports = TourValidator;
