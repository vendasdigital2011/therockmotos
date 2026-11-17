import { prisma } from './prisma';

export interface NotificationPayload {
  channel: 'WHATSAPP' | 'EMAIL' | 'SISTEMA';
  recipient: string;
  title?: string;
  content: string;
  trigger?: string;
}

export async function sendNotification(params: NotificationPayload) {
  const { channel, recipient, title, content, trigger } = params;

  // Em ambiente de produção conectaria a provedor (Z-API/Twilio/Sendgrid)
  // Em homologação simulamos o envio bem-sucedido e persistimos no log de mensagens
  const record = await prisma.notificationMessage.create({
    data: {
      channel,
      recipient,
      title: title || 'Notificação The Rock',
      content,
      status: 'ENVIADO',
      trigger: trigger || 'MANUAL',
    },
  });

  return record;
}

export async function getRecentNotifications() {
  return prisma.notificationMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
}
