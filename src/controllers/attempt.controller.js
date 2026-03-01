const { z } = require('zod');
const taskAttemptService = require('../services/taskAttempt.service');

const attemptSchema = z.object({
  answerPayload: z.any(),
});

exports.submitTaskAttempt = async (req, res, next) => {
  try {
    const { id: taskId } = req.params;
    const { answerPayload } = attemptSchema.parse(req.body);

    const userId = req.user.id;

    const result = await taskAttemptService.submitAttempt({
      userId,
      taskId,
      answerPayload,
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};