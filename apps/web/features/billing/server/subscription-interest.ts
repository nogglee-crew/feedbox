import { prisma } from "@/lib/db";

export async function hasSubscriptionInterest(email: string): Promise<boolean> {
  const row = await prisma.subscriptionInterest.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });
  return Boolean(row);
}

export async function requestSubscriptionInterest(input: {
  email: string;
  orgId: string;
}): Promise<void> {
  await prisma.subscriptionInterest.upsert({
    where: { email: input.email.toLowerCase() },
    update: {
      orgId: input.orgId,
      privacyAgreedAt: new Date(),
    },
    create: {
      email: input.email.toLowerCase(),
      orgId: input.orgId,
      privacyAgreedAt: new Date(),
    },
  });
}
