function mapTopic(topic, lang) {
  return {
    id: topic.id,
    title: lang === 'ru' ? topic.titleRu : topic.titleKz,
    description: lang === 'ru' ? topic.descriptionRu : topic.descriptionKz,
    coverImageUrl: topic.coverImageUrl,
    orderIndex: topic.orderIndex,
    createdAt: topic.createdAt,
    updatedAt: topic.updatedAt,
  };
}

function mapLesson(lesson, lang) {
  return {
    id: lesson.id,
    topicId: lesson.topicId,
    content: lang === 'ru' ? lesson.contentRu : lesson.contentKz,
    imageUrl: lesson.imageUrl,
    videoUrl: lesson.videoUrl,
    attachments: lesson.attachments,
    orderIndex: lesson.orderIndex,
    createdAt: lesson.createdAt,
    updatedAt: lesson.updatedAt,
  };
}

module.exports = { mapTopic, mapLesson };