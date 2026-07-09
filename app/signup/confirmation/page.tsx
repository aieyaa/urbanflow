export default function SignupConfirmationPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold">Vérifiez votre boîte mail</h1>
      <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
        Un email de confirmation vient de vous être envoyé. Cliquez sur le
        lien qu&apos;il contient pour activer votre compte UrbanFlow.
      </p>
    </div>
  );
}
