const contacts = [
  {
    title: "Email",
    value: "elea.ya.pro@gmail.com",
    href: "mailto:[EMAIL_ADDRESS]",
  },
  {
    title: "Adresse",
    value: "Paris Métropole, 75001 Paris",
  },
];

export default function ContactPage() {
  return (
    <div className="flex flex-1 flex-col items-center gap-8 px-6 py-16 text-center">
      <div className="flex max-w-md flex-col items-center gap-4">
        <h1 className="text-2xl font-semibold">Contact</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Une question, une suggestion ou un problème rencontré sur
          l&apos;application ? N&apos;hésitez pas à nous écrire, nous vous
          répondrons dans les meilleurs délais.
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-4">
        {contacts.map((contact) => (
          <div
            key={contact.title}
            className="flex flex-col gap-1 rounded-xl border border-black/[.08] p-5 dark:border-white/[.145]"
          >
            <p className="text-sm font-medium">{contact.title}</p>
            {contact.href ? (
              <a
                href={contact.href}
                className="text-sm text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400"
              >
                {contact.value}
              </a>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {contact.value}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
