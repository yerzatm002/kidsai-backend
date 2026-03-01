const { z } = require('zod');
const testAttemptService = require('../services/testAttempt.service');

const attemptSchema = z.object({
  answers: z.record(z.any()),
});

exports.submitTestAttempt = async (req, res, next) => {
  try {
    const { id: testId } = req.params;
    const { answers } = attemptSchema.parse(req.body);

    const userId = req.user.id;

    const result = await testAttemptService.submitTestAttempt({
      userId,
      testId,
      answers,
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};