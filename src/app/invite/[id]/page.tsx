import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

import { getAuthOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { AcceptInviteButton } from "./accept-invite-button";
import { SignInToAcceptButton } from "./sign-in-button";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: inviterId } = await params;
  const prisma = await getPrisma();
  const session = await getServerSession(await getAuthOptions());

  const inviter = await prisma.user.findUnique({
    where: { id: inviterId },
    select: { id: true, name: true },
  });
  if (!inviter) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-2xl font-semibold">
        {inviter.name ?? "一位 VibeHub 會員"} 邀請你加入 VibeHub
      </h1>
      <p className="mt-2 opacity-70">
        有想法,就上 VibeHub;會 AI,就一起把它做出來。
      </p>

      {!session?.user?.id && (
        <SignInToAcceptButton callbackUrl={`/invite/${inviter.id}`} />
      )}

      {session?.user?.id && session.user.id === inviter.id && (
        <p className="mt-4 text-sm opacity-70">這是你自己的邀請連結,分享給朋友吧。</p>
      )}

      {session?.user?.id && session.user.id !== inviter.id && (
        <ReferralStatus currentUserId={session.user.id} inviterId={inviter.id} />
      )}
    </div>
  );
}

async function ReferralStatus({
  currentUserId,
  inviterId,
}: {
  currentUserId: string;
  inviterId: string;
}) {
  const prisma = await getPrisma();
  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { referredById: true },
  });

  if (currentUser?.referredById === inviterId) {
    return <p className="mt-4 text-sm opacity-70">你已經接受過這個邀請了。</p>;
  }
  if (currentUser?.referredById) {
    return <p className="mt-4 text-sm opacity-70">你已經有其他邀請人了。</p>;
  }
  return <AcceptInviteButton inviterId={inviterId} />;
}
