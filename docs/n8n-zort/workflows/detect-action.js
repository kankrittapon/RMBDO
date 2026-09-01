const staticData = $getWorkflowStaticData('global');
staticData.paddleWaitByChat = staticData.paddleWaitByChat || {};

return $input.all().map((item) => {
  const update = item.json || {};
  const message = update.message || {};
  const text = String(message.text || message.caption || '').trim();
  const lower = text.toLowerCase();
  const command = lower.split(/\s+/)[0].replace(/^\/+/, '').replace(/@.+$/, '');
  const chatId = String(message.chat?.id || message.from?.id || '');
  const telegramUserId = message.from?.id || null;
  const messageId = message.message_id || null;
  const ownerId = String($env.PRIVATE_OWNER_TELEGRAM_USER_ID || '8205529862');
  const isOwner = ownerId ? String(telegramUserId || '') === ownerId : true;
  const isImage = Array.isArray(message.photo) && message.photo.length > 0;
  const isImageDocument = String(message.document?.mime_type || '').startsWith('image/');
  const wantsPaddleMode = lower === 'porc' || command === 'ocr';
  const waitingPaddle = Boolean(staticData.paddleWaitByChat[chatId]);
  const foodLike = Boolean(text) && (
    /^(ข้าว|กาแฟ|ชา|นม|เวย์|ไข่|ไก่|หมู|เนื้อ|ปลา|สลัด|กล้วย|ขนม|น้ำ|โยเกิร์ต|บะหมี่|ก๋วยเตี๋ยว|ผัด|ต้ม|แกง|ทอด|ยำ|สเต็ก|โปรตีน|อาหาร)/i.test(text)
    || /\b(kcal|cal|protein|rice|coffee|chicken|beef|pork|egg|milk|whey)\b/i.test(text)
  );

  let action = 'unknown_command';
  if (!isOwner) action = 'unauthorized';
  else if (command === 'debug' && /\blast\b/.test(lower)) action = 'debug_last';
  else if (command === 'help' && lower.trim() !== '/help' && lower.trim() !== 'help') action = 'help_detail';
  else if (command === 'help' || command === 'start') action = 'help';
  else if (command === 'today') action = 'today_summary';
  else if (command === 'slips' && /\bbatch\b|ชุด/.test(lower)) action = 'slip_batch';
  else if (command === 'slips') action = 'slip_history';
  else if (command === 'budget' && /\b(detail|details)\b|รายการ|ละเอียด/.test(lower)) action = 'budget_detail';
  else if (command === 'budget' && /\bamount\b|แก้ยอด/.test(lower)) action = 'slip_amount';
  else if (command === 'budget' && /\bcategories\b|หมวดทั้งหมด/.test(lower)) action = 'budget_categories';
  else if (command === 'budget' && /\btargets\b/.test(lower)) action = 'budget_targets';
  else if (command === 'budget' && /\btarget\b/.test(lower)) action = 'budget_target';
  else if (command === 'budget' && /\b(day|week|month|วัน|สัปดาห์|เดือน)\b/.test(lower)) action = 'budget_period';
  else if (command === 'budget' && /\bstart\b/.test(lower)) action = 'budget_start';
  else if (command === 'budget' && /\bcycle\b/.test(lower)) action = 'budget_cycle';
  else if (command === 'budget') action = 'budget_summary';
  else if (command === 'slipdelete' || lower.startsWith('ล้างสลิป ') || lower.startsWith('ลบสลิป ')) action = 'slip_delete';
  else if (command === 'slipcat' || command === 'หมวด') action = 'slip_category';
  else if (command === 'fooddelete' || command === 'eatdelete' || lower.startsWith('ลบอาหาร ')) action = 'food_delete';
  else if (command === 'trackeat' && /\\bdetail\\b|ละเอียด/.test(lower)) action = 'food_detail';
  else if (command === 'eat' || (!text.startsWith('/') && foodLike)) action = 'food_log';
  else if (command === 'caleat') action = 'food_batch_calculate';
  else if (command === 'trackeat') action = 'food_track';
  else if (wantsPaddleMode && !isImage && !isImageDocument) {
    staticData.paddleWaitByChat[chatId] = Date.now();
    action = 'paddle_wait';
  } else if ((isImage || isImageDocument) && waitingPaddle) {
    delete staticData.paddleWaitByChat[chatId];
    action = 'paddle_ocr';
  } else if (text === 'ประจำสัปดาห์' || command === 'week') action = 'weekly_report';
  else if (command === 'routine' && /\b(use|แทน)\b|วันนี้เล่น/.test(lower)) action = 'routine_override';
  else if (command === 'routine') action = 'routine_summary';
  else if (command === 'workout' && /\b(start|เริ่ม)\b/.test(lower)) action = 'workout_start';
  else if ((command === 'workout' && /\b(compare|progress|เทียบ)\b/.test(lower)) || command === 'progress') action = 'workout_compare';
  else if (command === 'workout') action = 'workout_summary';
  else if (lower.includes('garmin.com') || command === 'garmin') action = 'garmin_import';
  else if (isImage || isImageDocument) action = 'slip_ocr';

  return {
    json: {
      ...update,
      action,
      text,
      command,
      chatId,
      telegramUserId,
      messageId,
      mediaGroupId: message.media_group_id || null,
      batchId: message.media_group_id || null,
      isOwner,
      workflowVersionId: $workflow.id,
    },
    binary: item.binary,
  };
});
