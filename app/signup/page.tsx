import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold">Créer un compte UrbanFlow</h1>
        <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
          Accédez à vos itinéraires personnalisés et suivez vos déplacements.
        </p>
      </div>
      <SignupForm />
    </div>
  );
}
