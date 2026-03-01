// prisma/seed.js
require("dotenv").config();

const prisma = require("../src/utils/prisma");

async function main() {
  const badges = [
    { code: "FIRST_LESSON", titleKz: "Алғашқы сабақ", titleRu: "Первый урок", descriptionKz: "Бірінші сабақты ашып оқыдыңыз.", descriptionRu: "Вы открыли и прочитали первый урок.", iconUrl: null },
    { code: "TEST_MASTER", titleKz: "Тест шебері", titleRu: "Мастер тестов", descriptionKz: "3 тестте 80% немесе одан жоғары нәтиже көрсеттіңіз.", descriptionRu: "Вы набрали 80%+ в 3 тестах.", iconUrl: null },
    { code: "TASK_CHAMPION", titleKz: "Тапсырма чемпионы", titleRu: "Чемпион заданий", descriptionKz: "10 тапсырманы дұрыс орындадыңыз.", descriptionRu: "Вы правильно выполнили 10 заданий.", iconUrl: null },
    { code: "AI_EXPLORER", titleKz: "AI зерттеуші", titleRu: "AI-исследователь", descriptionKz: "AI көмекшісіне 5 рет жүгіндіңіз.", descriptionRu: "Вы обратились к AI-помощнику 5 раз.", iconUrl: null },
    { code: "AI_SAFETY", titleKz: "Қауіпсіз AI", titleRu: "Безопасный AI", descriptionKz: "Қауіпсіздік ережелерін оқып шықтыңыз.", descriptionRu: "Вы ознакомились со страницей безопасности.", iconUrl: null },
  ];

  for (const b of badges) {
    await prisma.badge.upsert({
      where: { code: b.code },
      update: b,
      create: b,
    });
  }

  console.log("✅ Badges seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });